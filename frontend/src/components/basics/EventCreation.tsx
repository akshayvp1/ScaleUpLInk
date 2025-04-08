import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
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

// Match your Mongoose schema
interface Ticket {
  id: number; // Local ID for React state management
  type: string;
  price: number | null;
  quantity: number | null;
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

const EventForm: React.FC = () => {
  // Initial form state based on Mongoose schema
  const [eventData, setEventData] = useState<EventFormData>({
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
    tickets: [
      { id: 1, type: 'Regular', price: null, quantity: null }
    ],
    ageRestriction: false,
    mainBanner: '',
    promotionalImage: ''
  });

  // const eventService = new EventService();
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Error state for form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Loading states for image uploads
  const [isUploadingMainBanner, setIsUploadingMainBanner] = useState(false);
  const [isUploadingPromoImage, setIsUploadingPromoImage] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setEventData({
      ...eventData,
      [field]: value
    });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // Ticket functions
  const addTicketType = () => {
    const newId = eventData.tickets.length > 0 
      ? Math.max(...eventData.tickets.map(t => t.id)) + 1 
      : 1;
    
    setEventData({
      ...eventData,
      tickets: [
        ...eventData.tickets,
        { id: newId, type: 'Regular', price: null, quantity: null }
      ]
    });
  };

  const removeTicketType = (id: number) => {
    setEventData({
      ...eventData,
      tickets: eventData.tickets.filter(ticket => ticket.id !== id)
    });
  };

  const updateTicketField = (id: number, field: keyof Ticket, value: any) => {
    setEventData({
      ...eventData,
      tickets: eventData.tickets.map(ticket => 
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    });
    
    // Clear ticket errors
    if (errors['tickets']) {
      setErrors({
        ...errors,
        tickets: ''
      });
    }
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ad-upload'); // Your Cloudinary upload preset

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dedrcfbxf/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url; // Return the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // File handling functions with Cloudinary integration
  const handleFileChange = async (field: 'mainBanner' | 'promotionalImage', file: File | null) => {
    if (!file) return;
    
    try {
      // Set loading state for the specific field
      if (field === 'mainBanner') {
        setIsUploadingMainBanner(true);
      } else {
        setIsUploadingPromoImage(true);
      }
      
      // Upload to Cloudinary and get URL
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      // Update form state with the Cloudinary URL
      handleInputChange(field, cloudinaryUrl);
      
      // Clear any errors
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: ''
        });
      }
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      setErrors({
        ...errors,
        [field]: `Failed to upload image. Please try again.`
      });
    } finally {
      // Clear loading state
      if (field === 'mainBanner') {
        setIsUploadingMainBanner(false);
      } else {
        setIsUploadingPromoImage(false);
      }
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation based on your Mongoose schema
    if (!eventData.eventTitle) {
      newErrors.eventTitle = 'Event title is required';
    }
    
    if (!eventData.eventDescription) {
      newErrors.eventDescription = 'Event description is required';
    }
    
    if (!eventData.eventType) {
      newErrors.eventType = 'Event type is required';
    }
    
    if (!eventData.venueName) {
      newErrors.venueName = 'Venue name is required';
    }
    
    if (!eventData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!eventData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    // Validate tickets
    if (eventData.tickets.length === 0) {
      newErrors.tickets = 'At least one ticket type is required';
    } else {
      for (const ticket of eventData.tickets) {
        if (!ticket.type) {
          newErrors.tickets = 'All ticket types must have a name';
          break;
        }
        
        if (ticket.price === null || ticket.price === undefined) {
          newErrors.tickets = 'Price is required for all tickets';
          break;
        }
        
        if (ticket.quantity === null || ticket.quantity === undefined) {
          newErrors.tickets = 'Quantity is required for all tickets';
          break;
        }
        
        if (ticket.price < 0) {
          newErrors.tickets = 'Price cannot be negative';
          break;
        }
        
        if (ticket.quantity < 0) {
          newErrors.tickets = 'Quantity cannot be negative';
          break;
        }
      }
    }
    
    // Validate images
    if (!eventData.mainBanner) {
      newErrors.mainBanner = 'Main banner image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare data for submission
  const prepareDataForSubmission = () => {
    // Convert null values to 0 for submission
    const preparedData = {
      ...eventData,
      tickets: eventData.tickets.map(ticket => ({
        ...ticket,
        price: ticket.price ?? 0,
        quantity: ticket.quantity ?? 0
      }))
    };
    
    return preparedData;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data with nulls converted to 0 for submission
      const dataToSubmit = prepareDataForSubmission();
      const result = await eventService.createEvent(dataToSubmit);
      setTimeout(()=>{
        toast.success('Event created successfully!');
      },2000)
      // Redirect to events list or event details page
      window.location.href = '/mainpage/dashboard/events';
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All changes will be lost.")) {
      // In a real app with Next.js, you would use router.push('/events')
      window.location.href = '/mainpage/dashboard/events';
      console.log("Form cancelled");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="eventTitle">Event Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="eventTitle" 
                    value={eventData.eventTitle}
                    onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                    placeholder="Enter event title" 
                    className={errors.eventTitle ? "border-red-500" : ""}
                    required
                  />
                  {errors.eventTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventTitle}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="eventType">Event Type <span className="text-red-500">*</span></Label>
                  <Select 
                    value={eventData.eventType}
                    onValueChange={(value) => handleInputChange('eventType', value)}
                  >
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
                  {errors.eventType && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="eventDescription">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="eventDescription"
                    value={eventData.eventDescription}
                    onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                    placeholder="Describe your event"
                    className={`min-h-32 ${errors.eventDescription ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.eventDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventDescription}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="eventVisibility">Event Visibility <span className="text-red-500">*</span></Label>
                  <Select 
                    value={eventData.eventVisibility}
                    onValueChange={(value) => handleInputChange('eventVisibility', value as 'Public' | 'Private')}
                  >
                    <SelectTrigger id="eventVisibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventData.startDate ? format(eventData.startDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={eventData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventData.endingDate ? format(eventData.endingDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={eventData.endingDate}
                        onSelect={(date) => handleInputChange('endingDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                  <Input 
                    id="startTime" 
                    type="time" 
                    value={eventData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={errors.startTime ? "border-red-500" : ""}
                    required
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endingTime">End Time</Label>
                  <Input 
                    id="endingTime" 
                    type="time"
                    value={eventData.endingTime}
                    onChange={(e) => handleInputChange('endingTime', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Venue Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Venue Details</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="venueName">Venue Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="venueName" 
                    value={eventData.venueName}
                    onChange={(e) => handleInputChange('venueName', e.target.value)}
                    placeholder="Enter venue name" 
                    className={errors.venueName ? "border-red-500" : ""}
                    required
                  />
                  {errors.venueName && (
                    <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="venueAddress">Address</Label>
                  <Input 
                    id="venueAddress"
                    value={eventData.venueAddress}
                    onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                    placeholder="Enter street address" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input 
                    id="city" 
                    value={eventData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City" 
                    className={errors.city ? "border-red-500" : ""}
                    required
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Ticket Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ticket Details <span className="text-red-500">*</span></h3>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={addTicketType}
                  className="flex items-center"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ticket Type
                </Button>
              </div>
              
              {errors.tickets && (
                <p className="text-red-500 text-sm">{errors.tickets}</p>
              )}
              
              <div className="space-y-4">
                {eventData.tickets.map((ticket, index) => (
                  <div key={ticket.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Ticket #{index + 1}</h4>
                      {eventData.tickets.length > 1 && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeTicketType(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`ticketType-${ticket.id}`}>Type <span className="text-red-500">*</span></Label>
                        <Select
                          value={ticket.type}
                          onValueChange={(value) => updateTicketField(ticket.id, 'type', value)}
                        >
                          <SelectTrigger id={`ticketType-${ticket.id}`}>
                            <SelectValue placeholder="Select ticket type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`ticketPrice-${ticket.id}`}>Price <span className="text-red-500">*</span></Label>
                        <Input 
                          id={`ticketPrice-${ticket.id}`}
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={ticket.price === null ? '' : ticket.price}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value);
                            updateTicketField(ticket.id, 'price', value);
                          }}
                          placeholder="Enter price" 
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`ticketQuantity-${ticket.id}`}>Quantity <span className="text-red-500">*</span></Label>
                        <Input 
                          id={`ticketQuantity-${ticket.id}`} 
                          type="number" 
                          min="0"
                          value={ticket.quantity === null ? '' : ticket.quantity}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value);
                            updateTicketField(ticket.id, 'quantity', value);
                          }}
                          placeholder="Enter quantity" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Age Restriction */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Age Restriction <span className="text-red-500">*</span></h3>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ageRestriction"
                  checked={eventData.ageRestriction}
                  onCheckedChange={(checked) => handleInputChange('ageRestriction', checked)}
                />
                <Label htmlFor="ageRestriction">This event has age restrictions</Label>
              </div>
            </div>
            
            {/* Event Branding */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Branding</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mainBanner">Main Banner <span className="text-red-500">*</span></Label>
                  <div className={`border-2 border-dashed rounded-md p-4 text-center ${errors.mainBanner ? "border-red-500" : ""}`}>
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended size: 1200×600px
                      </p>
                      <Input 
                        id="mainBanner" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange('mainBanner', e.target.files[0]);
                          }
                        }} 
                        required
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
                    {eventData.mainBanner && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Upload successful</p>
                        <div className="mt-2 border rounded overflow-hidden h-24 flex items-center justify-center">
                          <img 
                            src={eventData.mainBanner} 
                            alt="Banner preview" 
                            className="max-h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {errors.mainBanner && (
                      <p className="text-red-500 text-sm mt-1">{errors.mainBanner}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promotionalImage">Promotional Image (Optional)</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended size: 800×800px
                      </p>
                      <Input 
                        id="promotionalImage" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange('promotionalImage', e.target.files[0]);
                          }
                        }}
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
                    {eventData.promotionalImage && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Upload successful</p>
                        <div className="mt-2 border rounded overflow-hidden h-24 flex items-center justify-center">
                          <img 
                            src={eventData.promotionalImage} 
                            alt="Promotional image preview" 
                            className="max-h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingMainBanner || isUploadingPromoImage}
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