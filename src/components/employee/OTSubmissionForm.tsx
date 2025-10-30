import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateOTRequest } from '@/hooks/useOTRequests';
import { calculateHours, determineDayType, calculateOTAmount, checkEligibility } from '@/lib/ot-calculator';
import { OTCalculationPreview } from './OTCalculationPreview';
import { EligibilityCheck } from './EligibilityCheck';
import { ThresholdWarning } from './ThresholdWarning';
import { FileUpload } from '@/components/shared/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { DayType } from '@/types/otms';

const formSchema = z.object({
  ot_date: z.date({ required_error: 'OT date is required' }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters'),
  attachment: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const OTSubmissionForm = () => {
  const { user } = useAuth();
  const createMutation = useCreateOTRequest();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculations, setCalculations] = useState<{
    totalHours: number;
    dayType: DayType;
    orp: number;
    hrp: number;
    otAmount: number;
  } | null>(null);
  const [eligibility, setEligibility] = useState<{ isEligible: boolean; reason: string } | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ot_date: undefined,
      start_time: '',
      end_time: '',
      reason: '',
    },
  });

  const watchedDate = form.watch('ot_date');
  const watchedStartTime = form.watch('start_time');
  const watchedEndTime = form.watch('end_time');

  // Auto-calculate when date and times are provided
  useEffect(() => {
    const calculate = async () => {
      if (!watchedDate || !watchedStartTime || !watchedEndTime || !user) return;

      setIsCalculating(true);
      try {
        const dateStr = format(watchedDate, 'yyyy-MM-dd');
        
        // Calculate hours
        const hours = calculateHours(watchedStartTime, watchedEndTime);
        
        if (hours <= 0) {
          setCalculations(null);
          setEligibility(null);
          return;
        }

        // Determine day type
        const dayType = await determineDayType(dateStr);

        // Check eligibility
        const eligibilityResult = await checkEligibility(user.id, dateStr);
        setEligibility(eligibilityResult);

        if (!eligibilityResult.isEligible) {
          setCalculations(null);
          return;
        }

        // Get user's basic salary
        const { data: profile } = await supabase
          .from('profiles')
          .select('basic_salary')
          .eq('id', user.id)
          .single();

        if (!profile?.basic_salary) {
          setCalculations(null);
          return;
        }

        // Calculate OT amount
        const calc = await calculateOTAmount(profile.basic_salary, hours, dayType);

        setCalculations({
          totalHours: hours,
          dayType,
          orp: calc.orp,
          hrp: calc.hrp,
          otAmount: calc.otAmount,
        });
      } catch (error) {
        console.error('Calculation error:', error);
        setCalculations(null);
        setEligibility(null);
        toast({
          title: "Calculation Error",
          description: "We couldn't compute your OT right now. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [watchedDate, watchedStartTime, watchedEndTime, user]);

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('ot-attachments')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('ot-attachments')
      .getPublicUrl(data.path);

    setUploadedFileUrl(urlData.publicUrl);
  };

  const onSubmit = async (values: FormData) => {
    try {
      // Recompute values for submission
      const dateStr = format(values.ot_date, 'yyyy-MM-dd');
      const totalHours = calculateHours(values.start_time, values.end_time);
      
      if (totalHours <= 0) {
        toast({
          title: "Invalid Time Range",
          description: "Calculated hours must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      const dayType = await determineDayType(dateStr);

      await createMutation.mutateAsync({
        ot_date: dateStr,
        start_time: values.start_time,
        end_time: values.end_time,
        total_hours: totalHours,
        day_type: dayType,
        reason: values.reason,
        attachment_url: uploadedFileUrl || undefined
      });

      form.reset();
      setCalculations(null);
      setEligibility(null);
      setUploadedFileUrl(null);
    } catch (error: any) {
      console.error('Failed to create OT request:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit OT request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ot_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>OT Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('2024-01-01')}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isCalculating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating...
          </div>
        )}

        {eligibility && <EligibilityCheck eligibility={eligibility} />}

        {calculations && eligibility?.isEligible && (
          <>
            <OTCalculationPreview calculations={calculations} />
            <ThresholdWarning 
              totalHours={calculations.totalHours} 
              otDate={watchedDate ? format(watchedDate, 'yyyy-MM-dd') : ''} 
            />
          </>
        )}

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Overtime</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide detailed reason for overtime work..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supporting Document (Optional)</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={(file) => {
                    field.onChange(file);
                    handleFileUpload(file);
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5 * 1024 * 1024}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={
              !watchedDate || 
              !watchedStartTime || 
              !watchedEndTime || 
              calculateHours(watchedStartTime, watchedEndTime) <= 0 ||
              isCalculating || 
              createMutation.isPending
            }
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit OT Request'
            )}
          </Button>
          {(!watchedDate || !watchedStartTime || !watchedEndTime || (watchedStartTime && watchedEndTime && calculateHours(watchedStartTime, watchedEndTime) <= 0) || isCalculating) && (
            <p className="text-sm text-muted-foreground text-center">
              {isCalculating 
                ? 'Still calculating...' 
                : !watchedDate || !watchedStartTime || !watchedEndTime
                ? 'Select OT date, start and end time'
                : calculateHours(watchedStartTime, watchedEndTime) <= 0
                ? 'Calculated hours must be greater than 0'
                : 'Please complete all required fields'}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
