//manages All the Events 
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