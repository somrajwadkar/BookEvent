
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
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError('');

                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event:', err);

                setError(
                    err.response?.data?.message ||
                    'Failed to load event details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (event.availableSeats <= 0) {
            setError('Sorry, no seats are available for this event.');
            return;
        }

        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');

                setShowOTP(true);
                setSuccessMsg(
                    'OTP sent to your email. Please enter the OTP to confirm your booking.'
                );

                return;
            }

            if (!otp.trim()) {
                setError('Please enter the OTP.');
                return;
            }

            await api.post('/bookings', {
                eventId: event._id,
                otp: otp.trim(),
            });

            setSuccessMsg(
                'Booking requested successfully! Awaiting admin confirmation.'
            );

            setShowOTP(false);
            setOtp('');

            setEvent((prevEvent) => ({
                ...prevEvent,
                availableSeats: Math.max(
                    0,
                    prevEvent.availableSeats - 1
                ),
            }));
        } catch (err) {
            console.error('Booking error:', err);

            setError(
                err.response?.data?.message ||
                'Booking failed. Please try again.'
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-lg font-semibold text-gray-700">
                        Loading event details...
                    </p>
                </div>
            </div>
        );
    }

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

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : 'Date not available';

    const formattedTime = event.date
        ? new Date(event.date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition"
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-64 md:h-96 object-cover"
                        />
                    ) : (
                        <div className="w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center">
                            <span className="text-white/50 text-4xl md:text-6xl font-black uppercase tracking-widest">
                                {event.category || 'EVENT'}
                            </span>
                        </div>
                    )}

                    <div className="p-6 md:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            <div className="lg:col-span-2">
                                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide mb-4">
                                    {event.category || 'Event'}
                                </span>

                                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                                    {event.title}
                                </h1>

                                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                                    {event.description ||
                                        'No description available for this event.'}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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

                            <div>
                                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-6">

                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Booking Details
                                    </h2>

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

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-800">
                                            <FaChair />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">
                                                Available Seats
                                            </p>

                                            <p className="text-xl font-bold">
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

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {successMsg && (
                                        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm flex gap-2">
                                            <FaCheckCircle className="mt-0.5 shrink-0" />
                                            <span>{successMsg}</span>
                                        </div>
                                    )}

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
    
