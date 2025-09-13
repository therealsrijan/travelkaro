
'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useTrips, Booking, Trip, Member, TripPicture } from '@/contexts/trips-context';
import { useAuth } from '@/hooks/use-auth';
import { storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Edit, Calendar, IndianRupee, Upload, FileText, X, BedDouble, Plane, Train, Car, Pencil, MessageSquare, UserPlus, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTripDialog } from '@/components/create-trip-dialog';
import { CategorizeBookingDialog } from '@/components/categorize-booking-dialog';
import { PreviewBookingDialog } from '@/components/preview-booking-dialog';
import { AddMemberDialog } from '@/components/add-member-dialog';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ItineraryChatbot } from '@/components/itinerary-chatbot';


const categoryIcons: { [key: string]: React.ElementType } = {
    'Hotel': BedDouble,
    'Airbnb': BedDouble,
    'Flight': Plane,
    'Train': Train,
    'Cab': Car,
    'Others': FileText,
};

const stayCategories = ['Hotel', 'Airbnb'];
const transportCategories = ['Train', 'Flight', 'Cab'];

export default function TripDashboardPage() {
    const params = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const tripId = params.tripId ? decodeURIComponent(params.tripId as string) : undefined;
    const { trips, updateTrip, updateTripNotes, addMember, updateMember, removeMember, addPicturesToTrip, removePicture } = useTrips();
    
    const trip = useMemo(() => trips.find(t => t.id === tripId), [trips, tripId]);

    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isCategorizeDialogOpen, setCategorizeDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const bookingFileInputRef = useRef<HTMLInputElement>(null);
    const pictureFileInputRef = useRef<HTMLInputElement>(null);
    const noteRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
    const [previewingBooking, setPreviewingBooking] = useState<Booking | null>(null);
    const [editingBookingName, setEditingBookingName] = useState<string | null>(null);
    const [newBookingName, setNewBookingName] = useState('');
    const [isAddMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
    const [uploadingPictures, setUploadingPictures] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);


    const groupedBookings = useMemo(() => {
        if (!trip?.bookings) return {};
        return trip.bookings.reduce((acc, booking) => {
            let group = 'Others';
            if (stayCategories.includes(booking.category)) {
                group = 'Stays';
            } else if (transportCategories.includes(booking.category)) {
                group = 'Transport';
            }
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(booking);
            return acc;
        }, {} as { [key: string]: Booking[] });
    }, [trip?.bookings]);


    if (!trip) {
        // Find out if the trip exists in the list at all.
        const tripExists = trips.some(t => t.id === tripId);
        if (!tripExists && tripId) {
             notFound();
        }
        // If trip is undefined but might be loading, return null or a loader.
        return null;
    }
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setCategorizeDialogOpen(true);
        }
    };

    const handleCategorizeComplete = (category: string, note?: string) => {
        if (!selectedFile || !trip) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const fileUrl = reader.result as string;

            const newBooking: Booking = {
                id: Date.now().toString(),
                name: selectedFile.name,
                category,
                note,
                fileUrl,
                fileType: selectedFile.type,
            };
            
            const updatedBookings = [...(trip.bookings || []), newBooking];
            updateTrip({ ...trip, bookings: updatedBookings });

            // Reset state
            setSelectedFile(null);
            setCategorizeDialogOpen(false);
            if (bookingFileInputRef.current) {
                bookingFileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleRemoveBooking = (bookingId: string) => {
        if (!trip) return;
        const updatedBookings = trip.bookings?.filter(b => b.id !== bookingId);
        updateTrip({ ...trip, bookings: updatedBookings });
    };

    const handleNoteChange = (bookingId: string, newNote: string) => {
        if (tripId) {
            updateTripNotes(tripId, bookingId, newNote);
        }
    };

    const handleAddOrEditNote = (bookingId: string) => {
        const bookingExists = trip?.bookings?.some(b => b.id === bookingId && (b.note !== undefined));

        if (!bookingExists && trip) {
             const updatedBookings = trip.bookings?.map(b => 
                b.id === bookingId ? { ...b, note: '' } : b
            );
            updateTrip({ ...trip, bookings: updatedBookings });
        }

        setTimeout(() => {
            const noteTextArea = noteRefs.current[bookingId];
            if (noteTextArea) {
                noteTextArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                noteTextArea.focus();
            }
        }, 100);
    };

    const handleEditBookingName = (booking: Booking) => {
        setEditingBookingName(booking.id);
        setNewBookingName(booking.name);
    };

    const handleBookingNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBookingName(e.target.value);
    };

    const handleSaveBookingName = (bookingId: string) => {
        if (!trip) return;
        const updatedBookings = trip.bookings?.map(b => 
            b.id === bookingId ? { ...b, name: newBookingName } : b
        );
        updateTrip({ ...trip, bookings: updatedBookings || [] });
        setEditingBookingName(null);
    };

    const handleNameInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, bookingId: string) => {
        if (e.key === 'Enter') {
            handleSaveBookingName(bookingId);
        } else if (e.key === 'Escape') {
            setEditingBookingName(null);
        }
    };

    const handleAddMember = (member: Omit<Member, 'id'>) => {
        if (tripId) {
            addMember(tripId, member);
        }
    };

    const handleUpdateMember = (member: Member) => {
        if (tripId) {
            updateMember(tripId, member);
        }
    };

    const openEditMemberDialog = (member: Member) => {
        setMemberToEdit(member);
        setAddMemberDialogOpen(true);
    };

    const openAddMemberDialog = () => {
        setMemberToEdit(null);
        setAddMemberDialogOpen(true);
    }

     const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !tripId || !user?.email) return;

        setUploadingPictures(true);
        setUploadProgress(0);

        const totalFiles = files.length;
        const uploadedPictures: TripPicture[] = [];

        try {
            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];
                
                // Mock upload for development
                const mockUrl = URL.createObjectURL(file);
                
                uploadedPictures.push({
                    id: `${Date.now()}-${i}`,
                    url: mockUrl,
                    uploadedBy: user.email,
                    name: file.name,
                });
                setUploadProgress(((i + 1) / totalFiles) * 100);
            }
            
            addPicturesToTrip(tripId, uploadedPictures);

            toast({
                title: 'Upload Complete',
                description: `${totalFiles} picture(s) added to the trip (mock mode).`,
            });
        } catch (error) {
            console.error('Error uploading pictures: ', error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'Could not upload pictures. Please try again.',
            });
        } finally {
            setUploadingPictures(false);
            if (pictureFileInputRef.current) {
                pictureFileInputRef.current.value = '';
            }
        }
    };
    
    const BookingUploadArea = () => (
        <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg p-12 gap-4">
            <h3 className="text-lg font-medium text-foreground">Upload Your Traveling Details Here:</h3>
            <Button onClick={() => bookingFileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Booking
            </Button>
            <input 
                type="file" 
                ref={bookingFileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
            />
       </div>
    );

    return (
        <div className="flex flex-col gap-6 h-screen">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold">{trip.tripName}</h1>
                        <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
                            <Edit className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            <span>{trip.destination}</span>
                        </div>
                        {trip.travelDates && (
                             <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{format(trip.travelDates, 'PPP')}</span>
                            </div>
                        )}
                        {trip.budget && (
                            <div className="flex items-center gap-1.5">
                                <IndianRupee className="h-4 w-4" />
                                <span>{trip.budget}</span>
                           </div>
                        )}
                        {trip.numberOfPeople && (
                             <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{trip.numberOfPeople}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             <Tabs defaultValue="itinerary" className="w-full flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger value="itinerary" className="rounded-none">Itinerary</TabsTrigger>
                        {/* <TabsTrigger value="chat" className="rounded-none">Chat</TabsTrigger> */}
                        <TabsTrigger value="bookings" className="rounded-none">Bookings</TabsTrigger>
                        <TabsTrigger value="splits" className="rounded-none">Splits</TabsTrigger>
                        <TabsTrigger value="pictures" className="rounded-none">Pictures</TabsTrigger>
                        <TabsTrigger value="members" className="rounded-none">Members</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="itinerary" className="mt-4 flex-1">
                     <ItineraryChatbot tripContext={trip} />
                </TabsContent>
                {/* <TabsContent value="chat" className="mt-4">
                     <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-muted rounded-lg">
                        <p>Chat feature coming soon!</p>
                   </div>
                </TabsContent> */}
                <TabsContent value="bookings" className="mt-4 space-y-6">
                    {(!trip.bookings || trip.bookings.length === 0) ? (
                        <BookingUploadArea />
                    ) : (
                        <>
                            <BookingUploadArea />
                            {Object.entries(groupedBookings).map(([group, bookings]) => (
                                <Card key={group}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg">{group} Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {bookings.map((booking) => {
                                            const Icon = categoryIcons[booking.category] || FileText;
                                            return(
                                                <div key={booking.id} className="flex flex-col gap-4">
                                                    <div className="group relative">
                                                        <div className="border rounded-lg p-2 flex flex-col items-center justify-center aspect-square text-center">
                                                            <div className="flex-grow flex flex-col items-center justify-center">
                                                                <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                                                                <Button variant="outline" size="sm" className="mb-2" onClick={() => setPreviewingBooking(booking)}>Preview</Button>
                                                            </div>
                                                             {editingBookingName === booking.id ? (
                                                                <Input
                                                                    type="text"
                                                                    value={newBookingName}
                                                                    onChange={handleBookingNameChange}
                                                                    onBlur={() => handleSaveBookingName(booking.id)}
                                                                    onKeyDown={(e) => handleNameInputKeyDown(e, booking.id)}
                                                                    autoFocus
                                                                    className="text-xs h-auto p-1 text-center"
                                                                />
                                                            ) : (
                                                                <p 
                                                                    className="text-xs font-medium truncate w-full border-t pt-2 cursor-pointer"
                                                                    onClick={() => handleEditBookingName(booking)}
                                                                >
                                                                    {booking.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="icon" 
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveBooking(booking.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                             <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-6 w-6 bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleAddOrEditNote(booking.id)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {booking.note !== undefined && (
                                                         <div className="space-y-1">
                                                            <h4 className="text-sm font-medium">Notes:</h4>
                                                            <Textarea
                                                                ref={(el) => { if (el) noteRefs.current[booking.id] = el; }}
                                                                value={booking.note}
                                                                onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                                                                placeholder="Type here..."
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </TabsContent>
                 <TabsContent value="splits" className="mt-4">
                     <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-muted rounded-lg">
                        <p>Splits feature coming soon!</p>
                   </div>
                </TabsContent>
                 <TabsContent value="pictures" className="mt-4 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Photo Gallery</CardTitle>
                             <Button onClick={() => pictureFileInputRef.current?.click()} disabled={uploadingPictures}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Pictures
                            </Button>
                            <input
                                type="file"
                                ref={pictureFileInputRef}
                                className="hidden"
                                onChange={handlePictureUpload}
                                multiple
                                accept="image/*"
                            />
                        </CardHeader>
                        <CardContent>
                            {uploadingPictures && (
                                <div className="space-y-2">
                                    <p>Uploading...</p>
                                    <Progress value={uploadProgress} />
                                </div>
                            )}
                            {(!trip.pictures || trip.pictures.length === 0) && !uploadingPictures ? (
                                 <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg p-12 gap-4">
                                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                    <h3 className="text-lg font-medium text-foreground">No Pictures Yet</h3>
                                    <p className="text-muted-foreground text-sm">Upload pictures to share with your trip members.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {trip.pictures?.map((pic) => (
                                        <div key={pic.id} className="relative aspect-square group">
                                            <Image 
                                                src={pic.url}
                                                alt={pic.name}
                                                fill
                                                className="rounded-md object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                <p className="text-white text-xs truncate">{pic.name}</p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removePicture(trip.id, pic.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="members" className="mt-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={openAddMemberDialog}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]"></TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trip.members?.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>
                                            <Button variant="link" className="p-0" onClick={() => openEditMemberDialog(member)}>
                                                 {member.phone || 'Nil'}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            {!member.isYou && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently remove {member.name} from the trip. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => removeMember(trip.id, member.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            <CreateTripDialog 
                open={isEditDialogOpen}
                onOpenChange={setEditDialogOpen}
                trip={trip}
            />

            {selectedFile && (
                 <CategorizeBookingDialog
                    open={isCategorizeDialogOpen}
                    onOpenChange={setCategorizeDialogOpen}
                    fileName={selectedFile.name}
                    onUpload={handleCategorizeComplete}
                />
            )}

            {previewingBooking && (
                <PreviewBookingDialog
                    open={!!previewingBooking}
                    onOpenChange={() => setPreviewingBooking(null)}
                    booking={previewingBooking}
                />
            )}

            <AddMemberDialog
                open={isAddMemberDialogOpen}
                onOpenChange={setAddMemberDialogOpen}
                onAddMember={handleAddMember}
                memberToEdit={memberToEdit}
                onUpdateMember={handleUpdateMember}
                tripId={tripId}
            />
        </div>
    );
}

    