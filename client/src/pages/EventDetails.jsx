import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaChair,
    FaMoneyBillWave,
    FaArrowLeft,
    FaCheckCircle,
} from 'react-icons/fa';

import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

const EventDetail = () => {
    // Get event ID from the URL
    const { id } = useParams();

    // Used to navigate to different pages
    const navigate = useNavigate();

    // Get the logged-in user from AuthContext
    const { user } = useContext(AuthContext);

    // Store event details
    const [event, setEvent] = useState(null);

    // Loading state while fetching event details
    const [loading, setLoading] = useState(true);

    // Loading state while booking the event
    const [bookingLoading, setBookingLoading] = useState(false);

    // Store the OTP entered by the user
    const [otp, setOtp] = useState('');

    // Controls whether OTP input is displayed
    const [showOTP, setShowOTP] = useState(false);

    // Store error messages
    const [error, setError] = useState('');

    // Store success messages
    const [successMsg, setSuccessMsg] = useState('');

    // Fetch event details when the component loads
    // or when the event ID changes
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Start loading
                setLoading(true);

                // Clear previous errors
                setError('');

                // Get event details from backend
                const { data } = await api.get(`/events/${id}`);

                // Store the received event data
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event:', err);

                // Show backend error message if available
                setError(
                    err.response?.data?.message ||
                    'Failed to load event details.'
                );
            } finally {
                // Stop loading after request completes
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    // Handle the complete booking process
    const handleBooking = async () => {

        // If user is not logged in, redirect to login page
        if (!user) {
            navigate('/login');
            return;
        }

        // Check whether seats are available
        if (event.availableSeats <= 0) {
            setError('Sorry, no seats are available for this event.');
            return;
        }

        // Start booking process
        setBookingLoading(true);

        // Clear previous messages
        setError('');
        setSuccessMsg('');

        try {

            // First step: Send OTP to user's email
            if (!showOTP) {
                await api.post('/bookings/send-otp');

                // Show OTP input field
                setShowOTP(true);

                // Tell user to check email
                setSuccessMsg(
                    'OTP sent to your email. Please enter the OTP to confirm your booking.'
                );

                return;
            }

            // Make sure user entered an OTP
            if (!otp.trim()) {
                setError('Please enter the OTP.');
                return;
            }

            // Send booking request with event ID and OTP
            await api.post('/bookings', {
                eventId: event._id,
                otp: otp.trim(),
            });

            // Booking request was successfully created
            setSuccessMsg(
                'Booking requested successfully! Awaiting admin confirmation.'
            );

            // Hide OTP field
            setShowOTP(false);

            // Clear OTP input
            setOtp('');

            // Decrease available seats by 1
            setEvent((prevEvent) => ({
                ...prevEvent,
                availableSeats: Math.max(
                    0,
                    prevEvent.availableSeats - 1
                ),
            }));

        } catch (err) {
            console.error('Booking error:', err);

            // Show booking error from backend
            setError(
                err.response?.data?.message ||
                'Booking failed. Please try again.'
            );
        } finally {
            // Stop booking loader
            setBookingLoading(false);
        }
    };

    // Display loading screen while event details are being fetched
    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">

                    {/* Loading spinner */}
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-lg font-semibold text-gray-700">
                        Loading event details...
                    </p>
                </div>
            </div>
        );
    }

    // Display this message if event data could not be found
    if (!event) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">

                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Event Not Found
                    </h2>

                    <p className="text-gray-500 mb-6">
                        {error || 'The event you are looking for does not exist.'}
                    </p>

                    {/* Navigate back to events page */}
                    <button
                        onClick={() => navigate('/events')}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    // Convert event date into readable format
    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : 'Date not available';

    // Convert event time into readable format
    const formattedTime = event.date
        ? new Date(event.date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    // Check whether all seats are booked
    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition"
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Event image */}
                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-64 md:h-96 object-cover"
                        />
                    ) : (

                        // Display category when event image is not available
                        <div className="w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center">
                            <span className="text-white/50 text-4xl md:text-6xl font-black uppercase tracking-widest">
                                {event.category || 'EVENT'}
                            </span>
                        </div>
                    )}

                    <div className="p-6 md:p-10">

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Main event information */}
                            <div className="lg:col-span-2">

                                {/* Event category */}
                                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide mb-4">
                                    {event.category || 'Event'}
                                </span>

                                {/* Event title */}
                                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                                    {event.title}
                                </h1>

                                {/* Event description */}
                                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                                    {event.description ||
                                        'No description available for this event.'}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Event date and time */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">

                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-800">
                                            <FaCalendarAlt />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                Date
                                            </p>

                                            <p className="font-semibold text-gray-800">
                                                {formattedDate}
                                            </p>

                                            {formattedTime && (
                                                <p className="text-sm text-gray-500">
                                                    {formattedTime}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Event location */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">

                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-800">
                                            <FaMapMarkerAlt />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                Location
                                            </p>

                                            <p className="font-semibold text-gray-800">
                                                {event.location ||
                                                    'Location not available'}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Booking section */}
                            <div>
                                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-6">

                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Booking Details
                                    </h2>

                                    {/* Ticket price */}
                                    <div className="flex items-center gap-4 mb-6">

                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-800">
                                            <FaMoneyBillWave />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                Ticket Price
                                            </p>

                                            <p className="text-xl font-bold">
                                                {event.ticketPrice === 0 ? (
                                                    <span className="text-green-600">
                                                        Free
                                                    </span>
                                                ) : (
                                                    `₹${event.ticketPrice}`
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Available seats */}
                                    <div className="flex items-center gap-4 mb-6">

                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-800">
                                            <FaChair />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                Available Seats
                                            </p>

                                            <p className="text-xl font-bold">

                                                {/* Change text color based on number of seats */}
                                                <span
                                                    className={
                                                        isSoldOut
                                                            ? 'text-red-500'
                                                            : event.availableSeats < 10
                                                            ? 'text-orange-500'
                                                            : 'text-gray-800'
                                                    }
                                                >
                                                    {event.availableSeats}
                                                </span>

                                                <span className="text-gray-500 text-base">
                                                    {' '}
                                                    / {event.totalSeats}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 my-6"></div>

                                    {/* Display error message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Display success message */}
                                    {successMsg && (
                                        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm flex gap-2">
                                            <FaCheckCircle className="mt-0.5 shrink-0" />
                                            <span>{successMsg}</span>
                                        </div>
                                    )}

                                    {/* OTP input is displayed after OTP is sent */}
                                    {showOTP && (
                                        <div className="mb-4">

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Enter OTP
                                            </label>

                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) =>
                                                    setOtp(e.target.value)
                                                }
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    {/* Booking button */}
                                    <button
                                        onClick={handleBooking}
                                        disabled={
                                            bookingLoading || isSoldOut
                                        }
                                        className={`w-full py-3.5 rounded-xl font-bold text-white transition ${
                                            isSoldOut
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : bookingLoading
                                                ? 'bg-gray-700 cursor-not-allowed'
                                                : 'bg-gray-900 hover:bg-gray-800'
                                        }`}
                                    >
                                        {bookingLoading
                                            ? 'Processing...'
                                            : isSoldOut
                                            ? 'Sold Out'
                                            : showOTP
                                            ? 'Confirm Booking'
                                            : user
                                            ? 'Book Now'
                                            : 'Login to Book'}
                                    </button>

                                    {/* Helpful message shown while OTP verification is active */}
                                    {showOTP && (
                                        <p className="text-xs text-gray-500 text-center mt-3">
                                            Check your registered email for
                                            the OTP.
                                        </p>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;