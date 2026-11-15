import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Upload, Loader2, ImageIcon, CheckCircle2, X, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '../ui/switch';
import eventService from '../../services/event/eventService';
import toast from 'react-hot-toast';

interface Ticket {
  id: number;
  type: string;
  price: number;
  quantity: number;
}

interface EventFormData {
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime: string;
  eventVisibility: 'Public' | 'Private';
  venueName: string;
  venueAddress: string;
  city: string;
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage: string;
}

// Utility function to safely extract error message
const getErrorMessage = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
};

// Small section heading used across the form for consistent visual rhythm
const SectionHeading: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
    <div className="flex items-baseline justify-between border-b pb-3">
    <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
    {description && <span className="text-xs text-muted-foreground">{description}</span>}
  </div>
);

const EventForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMainBanner, setIsUploadingMainBanner] = useState(false);
  const [isUploadingPromoImage, setIsUploadingPromoImage] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      eventTitle: '',
      eventDescription: '',
      eventType: '',
      startDate: new Date(),
      startTime: '',
      endingDate: new Date(),
      endingTime: '',
      eventVisibility: 'Public',
      venueName: '',
      venueAddress: '',
      city: '',
      tickets: [{ id: 1, type: 'Regular', price: 0, quantity: 0 }],
      ageRestriction: false,
      mainBanner: '',
      promotionalImage: ''
    },
    mode: 'onChange'
  });

  const tickets = watch('tickets');
  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const mainBanner = watch('mainBanner');
  const promotionalImage = watch('promotionalImage');

  const addTicketType = () => {
    const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    setValue('tickets', [...tickets, { id: newId, type: 'Regular', price: 0, quantity: 0 }]);
  };

  const removeTicketType = (id: number) => {
    setValue('tickets', tickets.filter(ticket => ticket.id !== id));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ad-upload');
    formData.append("folder", "scaleuplink/events");

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dedrcfbxf/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleFileChange = async (field: 'mainBanner' | 'promotionalImage', file: File | null) => {
    if (!file) return;

    try {
      if (field === 'mainBanner') setIsUploadingMainBanner(true);
      else setIsUploadingPromoImage(true);

      const cloudinaryUrl = await uploadToCloudinary(file);
      setValue(field, cloudinaryUrl);
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      toast.error(`Failed to upload ${field === 'mainBanner' ? 'main banner' : 'promotional image'}`);
    } finally {
      if (field === 'mainBanner') setIsUploadingMainBanner(false);
      else setIsUploadingPromoImage(false);
    }
  };

  const handleRemoveImage = (field: 'mainBanner' | 'promotionalImage') => {
    setValue(field, '');
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await eventService.createEvent(data);
      setTimeout(() => {
        toast.success('Event created successfully!');
      }, 2000);
      window.location.href = '/mainpage/dashboard/events';
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      window.location.href = '/mainpage/dashboard/events';
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Shared uploader UI for the two image fields — keeps banner/promo visually identical
  const renderImageUploader = (
    field: 'mainBanner' | 'promotionalImage',
    value: string,
    isUploading: boolean,
    label: string,
    helperText: string,
    hasError?: boolean
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field}>{label}</Label>
        {value && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Uploaded
          </span>
        )}
      </div>

      <input
        id={field}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileChange(field, e.target.files[0])}
      />

      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-border">
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <img src={value} alt={`${label} preview`} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/30 md:bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById(field)?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveImage(field)}
              disabled={isUploading}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => document.getElementById(field)?.click()}
          disabled={isUploading}
          className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors duration-200 ${
            hasError
              ? 'border-destructive/60 bg-destructive/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/40'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground">{helperText}</p>
            </>
          )}
        </button>
      )}

      {hasError && !value && (
        <p className="text-destructive text-sm">{getErrorMessage(errors.mainBanner)}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-2xl font-bold tracking-tight [font-family:var(--font-display)]">Create new event</CardTitle>
            <CardDescription>Fill in the details below to publish your event</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <SectionHeading title="Basic information" />
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="eventTitle">Event title</Label>
                  <Input
                    id="eventTitle"
                    {...register('eventTitle', {
                      required: 'Event title is required',
                      pattern: {
                        value: /^[A-Z][a-zA-Z\s]*$/,
                        message: 'Must start with a capital letter and contain valid characters'
                      },
                      validate: value => value.trim().length > 0 || 'Event title cannot be only spaces'
                    })}
                    placeholder="Enter event title"
                    className={errors.eventTitle ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.eventTitle && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.eventTitle)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eventType">Event type</Label>
                  <Controller
                    name="eventType"
                    control={control}
                    rules={{ required: 'Event type is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="eventType" className={errors.eventType ? "border-destructive focus-visible:ring-destructive/40" : ""}>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conference">Conference</SelectItem>
                          <SelectItem value="Concert">Concert</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Exhibition">Exhibition</SelectItem>
                          <SelectItem value="Meetup">Meetup</SelectItem>
                          <SelectItem value="Party">Party</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.eventType && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.eventType)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eventDescription">Description</Label>
                  <Textarea
                    id="eventDescription"
                    {...register('eventDescription', {
                      required: 'Description is required',
                      validate: value => value.trim().length > 0 || 'Description cannot be only spaces'
                    })}
                    placeholder="Describe your event"
                    className={`min-h-32 ${errors.eventDescription ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                  />
                  {errors.eventDescription && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.eventDescription)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eventVisibility">Event visibility</Label>
                  <Controller
                    name="eventVisibility"
                    control={control}
                    rules={{ required: 'Event visibility is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="eventVisibility" className={errors.eventVisibility ? "border-destructive focus-visible:ring-destructive/40" : ""}>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.eventVisibility && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.eventVisibility)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <SectionHeading title="Schedule" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label>Start date</Label>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{
                      required: 'Start date is required',
                      validate: value => value >= today || 'Start date must be today or later'
                    }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full justify-start text-left font-normal ${errors.startDate ? "border-destructive" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {field.value ? format(field.value, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date || new Date())}
                            disabled={(date) => date < today}
                            
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.startDate)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>End date</Label>
                  <Controller
                    name="endingDate"
                    control={control}
                    rules={{
                      required: 'End date is required',
                      validate: value => value >= startDate || 'End date must be same or after start date'
                    }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full justify-start text-left font-normal ${errors.endingDate ? "border-destructive" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {field.value ? format(field.value, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date || new Date())}
                            disabled={(date) => date < startDate}
                            
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.endingDate && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.endingDate)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="startTime">Start time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime', { required: 'Start time is required' })}
                    className={errors.startTime ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.startTime && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.startTime)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endingTime">End time</Label>
                  <Input
                    id="endingTime"
                    type="time"
                    {...register('endingTime', {
                      validate: value => !value || (startTime && value > startTime) || 'End time must be after start time'
                    })}
                    className={errors.endingTime ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.endingTime && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.endingTime)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="space-y-4">
              <SectionHeading title="Venue details" />
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="venueName">Venue name</Label>
                  <Input
                    id="venueName"
                    {...register('venueName', {
                      required: 'Venue name is required',
                      validate: value => value.trim().length > 0 || 'Venue name cannot be only spaces'
                    })}
                    placeholder="Enter venue name"
                    className={errors.venueName ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.venueName && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.venueName)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="venueAddress">Address</Label>
                  <Input
                    id="venueAddress"
                    {...register('venueAddress', {
                      validate: value => !value || value.trim().length > 0 || 'Address cannot be only spaces'
                    })}
                    placeholder="Enter street address"
                    className={errors.venueAddress ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.venueAddress && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.venueAddress)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city', {
                      required: 'City is required',
                      validate: value => value.trim().length > 0 || 'City cannot be only spaces'
                    })}
                    placeholder="City"
                    className={errors.city ? "border-destructive focus-visible:ring-destructive/40" : ""}
                  />
                  {errors.city && (
                    <p className="text-destructive text-sm">{getErrorMessage(errors.city)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b pb-3">
                <h3 className="text-base font-semibold text-foreground">Ticket details</h3>
                <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add ticket type
                </Button>
              </div>

              <div className="space-y-3">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <TicketIcon className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-sm font-semibold text-foreground">Ticket #{index + 1}</h4>
                      </div>
                      {tickets.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeTicketType(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor={`ticketType-${ticket.id}`}>Type</Label>
                        <Controller
                          name={`tickets.${index}.type`}
                          control={control}
                          rules={{ required: 'Ticket type is required' }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id={`ticketType-${ticket.id}`} className={errors.tickets?.[index]?.type ? "border-destructive focus-visible:ring-destructive/40" : "bg-background"}>
                                <SelectValue placeholder="Select ticket type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="Gold">Gold</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.tickets?.[index]?.type && (
                          <p className="text-destructive text-sm">{getErrorMessage(errors.tickets[index].type)}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`ticketPrice-${ticket.id}`}>Price</Label>
                        <Input
                          id={`ticketPrice-${ticket.id}`}
                          type="number"
                          step="0.01"
                          {...register(`tickets.${index}.price`, {
                            required: 'Price is required',
                            min: { value: 0, message: 'Price cannot be negative' },
                            valueAsNumber: true
                          })}
                          placeholder="0.00"
                          className={`bg-background ${errors.tickets?.[index]?.price ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                        />
                        {errors.tickets?.[index]?.price && (
                          <p className="text-destructive text-sm">{getErrorMessage(errors.tickets[index].price)}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`ticketQuantity-${ticket.id}`}>Quantity</Label>
                        <Input
                          id={`ticketQuantity-${ticket.id}`}
                          type="number"
                          {...register(`tickets.${index}.quantity`, {
                            required: 'Quantity is required',
                            min: { value: 0, message: 'Quantity cannot be negative' },
                            max: { value: 100, message: 'Quantity cannot exceed 100' },
                            valueAsNumber: true
                          })}
                          placeholder="0"
                          className={`bg-background ${errors.tickets?.[index]?.quantity ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                        />
                        {errors.tickets?.[index]?.quantity && (
                          <p className="text-destructive text-sm">{getErrorMessage(errors.tickets[index].quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Restriction */}
            <div className="space-y-4">
              <SectionHeading title="Age restriction" />
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <div>
                  <Label htmlFor="ageRestriction" className="text-sm font-medium text-foreground">
                    This event has age restrictions
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Attendees will need to confirm their age before registering</p>
                </div>
                <Controller
                  name="ageRestriction"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="ageRestriction"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Event Branding */}
            <div className="space-y-4">
              <SectionHeading title="Event branding" description="Used across listings and promotion" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderImageUploader(
                  'mainBanner',
                  mainBanner,
                  isUploadingMainBanner,
                  'Main banner',
                  'Recommended size: 1200×600px',
                  !!errors.mainBanner
                )}
                {renderImageUploader(
                  'promotionalImage',
                  promotionalImage,
                  isUploadingPromoImage,
                  'Promotional image (optional)',
                  'Recommended size: 800×800px'
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-3 border-t border-border bg-muted/20 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingMainBanner || isUploadingPromoImage || !mainBanner}
              className="shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create event'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EventForm;