



import React, { useState } from 'react';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Upload, Loader2 } from 'lucide-react';
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
const getErrorMessage = (error: any): string | undefined => {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string;
  }
  return undefined;
};

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Event</CardTitle>
            <CardDescription>Fill in the details to create your event</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="eventTitle">Event Title</Label>
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
                    className={errors.eventTitle ? "border-red-500" : ""}
                  />
                  {errors.eventTitle && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.eventTitle)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Controller
                    name="eventType"
                    control={control}
                    rules={{ required: 'Event type is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="eventType" className={errors.eventType ? "border-red-500" : ""}>
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
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.eventType)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventDescription">Description</Label>
                  <Textarea
                    id="eventDescription"
                    {...register('eventDescription', {
                      required: 'Description is required',
                      validate: value => value.trim().length > 0 || 'Description cannot be only spaces'
                    })}
                    placeholder="Describe your event"
                    className={`min-h-32 ${errors.eventDescription ? "border-red-500" : ""}`}
                  />
                  {errors.eventDescription && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.eventDescription)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventVisibility">Event Visibility</Label>
                  <Controller
                    name="eventVisibility"
                    control={control}
                    rules={{ required: 'Event visibility is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="eventVisibility" className={errors.eventVisibility ? "border-red-500" : ""}>
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
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.eventVisibility)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
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
                            className={`w-full justify-start text-left font-normal ${errors.startDate ? "border-red-500" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date || new Date())}
                            disabled={(date) => date < today}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.startDate)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
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
                            className={`w-full justify-start text-left font-normal ${errors.endingDate ? "border-red-500" : ""}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date || new Date())}
                            disabled={(date) => date < startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.endingDate && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.endingDate)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime', { required: 'Start time is required' })}
                    className={errors.startTime ? "border-red-500" : ""}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.startTime)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endingTime">End Time</Label>
                  <Input
                    id="endingTime"
                    type="time"
                    {...register('endingTime', {
                      validate: value => !value || (startTime && value > startTime) || 'End time must be after start time'
                    })}
                    className={errors.endingTime ? "border-red-500" : ""}
                  />
                  {errors.endingTime && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.endingTime)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Venue Details</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="venueName">Venue Name</Label>
                  <Input
                    id="venueName"
                    {...register('venueName', {
                      required: 'Venue name is required',
                      validate: value => value.trim().length > 0 || 'Venue name cannot be only spaces'
                    })}
                    placeholder="Enter venue name"
                    className={errors.venueName ? "border-red-500" : ""}
                  />
                  {errors.venueName && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.venueName)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="venueAddress">Address</Label>
                  <Input
                    id="venueAddress"
                    {...register('venueAddress', {
                      validate: value => !value || value.trim().length > 0 || 'Address cannot be only spaces'
                    })}
                    placeholder="Enter street address"
                    className={errors.venueAddress ? "border-red-500" : ""}
                  />
                  {errors.venueAddress && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.venueAddress)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city', {
                      required: 'City is required',
                      validate: value => value.trim().length > 0 || 'City cannot be only spaces'
                    })}
                    placeholder="City"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.city)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ticket Details</h3>
                <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ticket Type
                </Button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Ticket #{index + 1}</h4>
                      {tickets.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTicketType(ticket.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`ticketType-${ticket.id}`}>Type</Label>
                        <Controller
                          name={`tickets.${index}.type`}
                          control={control}
                          rules={{ required: 'Ticket type is required' }}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id={`ticketType-${ticket.id}`} className={errors.tickets?.[index]?.type ? "border-red-500" : ""}>
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
                          <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.tickets[index].type)}</p>
                        )}
                      </div>

                      <div>
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
                          placeholder="Enter price"
                          className={errors.tickets?.[index]?.price ? "border-red-500" : ""}
                        />
                        {errors.tickets?.[index]?.price && (
                          <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.tickets[index].price)}</p>
                        )}
                      </div>

                      <div>
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
                          placeholder="Enter quantity"
                          className={errors.tickets?.[index]?.quantity ? "border-red-500" : ""}
                        />
                        {errors.tickets?.[index]?.quantity && (
                          <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.tickets[index].quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Restriction */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Age Restriction</h3>
              <div className="flex items-center space-x-2">
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
                <Label htmlFor="ageRestriction">This event has age restrictions</Label>
              </div>
            </div>

            {/* Event Branding */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mainBanner">Main Banner</Label>
                  <div className={`border-2 border-dashed rounded-md p-4 text-center ${errors.mainBanner ? "border-red-500" : ""}`}>
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended size: 1200×600px</p>
                      <input
                        id="mainBanner"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileChange('mainBanner', e.target.files[0])}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('mainBanner')?.click()}
                        disabled={isUploadingMainBanner}
                      >
                        {isUploadingMainBanner ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Select file'
                        )}
                      </Button>
                    </div>
                    {mainBanner && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Upload successful</p>
                        <div className="mt-2 border rounded overflow-hidden h-24 flex items-center justify-center">
                          <img src={mainBanner} alt="Banner preview" className="max-h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {errors.mainBanner && (
                      <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.mainBanner)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotionalImage">Promotional Image (Optional)</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended size: 800×800px</p>
                      <input
                        id="promotionalImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileChange('promotionalImage', e.target.files[0])}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('promotionalImage')?.click()}
                        disabled={isUploadingPromoImage}
                      >
                        {isUploadingPromoImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Select file'
                        )}
                      </Button>
                    </div>
                    {promotionalImage && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Upload successful</p>
                        <div className="mt-2 border rounded overflow-hidden h-24 flex items-center justify-center">
                          <img src={promotionalImage} alt="Promotional preview" className="max-h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingMainBanner || isUploadingPromoImage || !mainBanner}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EventForm;