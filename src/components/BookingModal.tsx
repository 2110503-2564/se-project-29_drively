'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BookingModalProps {
  carId: string
  isAvailable: boolean
  token: string  // Add token to props
}

export default function BookingModal({ carId, isAvailable, token }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate dates
    const pickupDateTime = new Date(pickupDate)
    const returnDateTime = new Date(returnDate)
    
    if (returnDateTime <= pickupDateTime) {
      alert('Return date must be after pickup date')
      return
    }

    try {
      const response = await fetch('https://back-end-car.vercel.app/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId,
          pickupDate: pickupDate + 'T00:00:00.000Z',
          returnDate: returnDate + 'T00:00:00.000Z',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsOpen(false)
        router.refresh()
        alert('Booking successful!')
      } else {
        alert('Booking successful!')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error creating booking. Please try again.')
    }
  }

  if (!isAvailable) return null

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Book Now
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Book this car</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
