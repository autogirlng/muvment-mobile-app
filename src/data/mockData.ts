// src/data/mockData.ts

// --- TRIPS DATA ---
export const GROUPED_TRIPS_DATA = [
  {
    title: 'Today, Thursday 12 Jan',
    data: [
      {
        id: '1',
        badges: [{ label: 'ONGOING' }, { label: 'FULL DAY RENTAL' }, { label: 'CUSTOMER' }],
        clientName: 'Chief Emeka Obiora',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '2:00 PM - 2:00 AM (24 hrs)',
        tripId: 'TRP-2026-102846'
      },
      {
        id: '2',
        badges: [{ label: 'AWAITING PICKUP' }, { label: 'FULL DAY RENTAL' }, { label: 'COMPANY' }],
        clientName: 'Mr Clark Hakeam',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '3:00 PM - 3:00 AM (24 hrs)',
        tripId: 'TRP-2026-102846'
      }
    ]
  },
  {
    title: 'Tomorrow, Friday 13 Jan',
    data: [
      {
        id: '3',
        badges: [{ label: 'NOT STARTED' }, { label: 'STANDARD' }, { label: 'MAINTENANCE' }],
        clientName: 'Dr Smith Ogbonna',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '3:00 PM - 3:00 AM (12 hrs)',
        tripId: 'TRP-2026-102846'
      }
    ]
  },
  {
    title: 'Monday 17 Jan',
    data: [
      {
        id: '4',
        badges: [{ label: 'NOT STARTED' }, { label: 'STANDARD' }, { label: 'COMPANY' }],
        clientName: 'Dr Smith Ogbonna',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '3:00 PM - 3:00 AM (12 hrs)',
        tripId: 'TRP-2026-102846'
      },
      {
        id: '5',
        badges: [{ label: 'COMPLETE' }, { label: 'STANDARD' }, { label: 'COMPANY' }],
        clientName: 'Chief Emeka Obiora',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '3:00 PM - 3:00 AM (12 hrs)',
        tripId: 'TRP-2026-102846'
      }
    ]
  },
  {
    title: 'Yesterday, Wednesday 11 Jan',
    data: [
      {
        id: '6',
        badges: [{ label: 'COMPLETE' }, { label: 'AIRPORT' }, { label: 'COMPANY' }],
        clientName: 'Chief Emeka Obiora',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '3:00 PM - 3:00 AM (12 hrs)',
        tripId: 'TRP-2026-102846'
      }
    ]
  },
  {
    title: 'Last Week, Wednesday 11 Jan', 
    data: [
      {
        id: '7',
        badges: [{ label: 'COMPLETE' }, { label: 'FULL DAY RENTAL' }, { label: 'CUSTOMER' }],
        clientName: 'Chief Emeka Obiora',
        location: 'Autogirl Service Center, Lekki',
        vehicle: 'Honda Accord • LAG-567-ABJ',
        timeRange: '2:00 PM - 2:00 AM (24 hrs)',
        tripId: 'TRP-2026-102846'
      }
    ]
  }
];

export const FLAT_TRIPS_DATA = GROUPED_TRIPS_DATA.flatMap(section => section.data);

// --- NOTIFICATIONS DATA ---
export const GROUPED_NOTIFICATIONS_DATA = [
  {
    section: 'TODAY',
    data: [
      {
        id: '1',
        iconName: 'dollar-sign' as const,
        title: 'Payment Request Approved',
        description: 'Your extra hours request has been approved.',
        timestamp: 'about 2 hours ago',
        isDismissible: true,
      },
      {
        id: '2',
        iconName: 'clock' as const,
        title: 'Upcoming Pickup Reminder',
        description: 'Your trip with John Doe starts in 30 minutes.',
        timestamp: 'about 3 hours ago',
        isDismissible: false,
      }
    ]
  },
  {
    section: 'YESTERDAY',
    data: [
      {
        id: '3',
        iconName: 'clock' as const,
        title: 'New Trip Assigned',
        description: 'Airport pickup at Terminal 2, Gate B3.',
        timestamp: '1 day ago',
        isDismissible: false,
      }
    ]
  },
  {
    section: 'OLDER',
    data: [
      {
        id: '4',
        iconName: 'dollar-sign' as const,
        title: 'Payment Request Rejected',
        description: 'Your overtime claim for January 15 was not approved. Contact support.',
        timestamp: '3 days ago',
        isDismissible: false,
      }
    ]
  }
];
// --- PAYMENTS DATA ---
export const GROUPED_PAYMENTS_DATA = [
  {
    section: 'Today',
    data: [
      {
        id: '1',
        category: 'EXTRA HOURS',
        status: 'PENDING',
        clientName: 'Chief Emeka Obiora',
        tripId: 'TRP-2026-102846',
        date: 'Feb 18, 2026',
        duration: '3h Extra'
      },
      {
        id: '2',
        category: 'INTERSTATE',
        status: 'IN REVIEW',
        clientName: 'Mrs Angela Tolu',
        tripId: 'TRP-2026-102851',
        date: 'Feb 18, 2026',
        duration: 'Interstate Trip'
      },
      {
        id: '3',
        category: 'OFF DAY',
        status: 'APPROVED',
        clientName: 'Mr Clark Hakeam',
        tripId: 'TRP-2026-102852',
        date: 'Feb 18, 2026',
        duration: 'Off Day'
      }
    ]
  },
  {
    section: 'Yesterday',
    data: [
      {
        id: '4',
        category: 'EXTRA HOURS',
        status: 'PAID',
        clientName: 'Dr Smith Ogbonna',
        tripId: 'TRP-2026-102839',
        date: 'Feb 17, 2026',
        duration: '2h Extra'
      },
      {
        id: '5',
        category: 'INTERSTATE',
        status: 'APPROVED',
        clientName: 'Chief Emeka Obiora',
        tripId: 'TRP-2026-102835',
        date: 'Feb 17, 2026',
        duration: 'Interstate Trip'
      },
      {
        id: '6',
        category: 'OFF DAY',
        status: 'PENDING',
        clientName: 'Mrs Angela Tolu',
        tripId: 'TRP-2026-102833',
        date: 'Feb 17, 2026',
        duration: 'Off Day'
      }
    ]
  },
  {
    section: 'Older',
    data: [
      {
        id: '7',
        category: 'OFF DAY',
        status: 'REJECTED',
        clientName: 'Dr Smith Ogbonna',
        tripId: 'TRP-2026-102801',
        date: 'Feb 12, 2026',
        duration: 'Off Day'
      },
      {
        id: '8',
        category: 'EXTRA HOURS',
        status: 'IN REVIEW',
        clientName: 'Mr Clark Hakeam',
        tripId: 'TRP-2026-102794',
        date: 'Feb 10, 2026',
        duration: '4h Extra'
      },
      {
        id: '9',
        category: 'INTERSTATE',
        status: 'PAID',
        clientName: 'Chief Emeka Obiora',
        tripId: 'TRP-2026-102781',
        date: 'Feb 8, 2026',
        duration: 'Interstate Trip'
      }
    ]
  }
];

export const MOCK_SELECTED_TRIP = {
  id: '3',
  badges: [{ label: 'COMPLETE' }, { label: 'STANDARD' }, { label: 'MAINTENANCE' }],
  clientName: 'Dr Smith Ogbonna',
  location: 'Autogirl Service Center, Lekki',
  vehicle: 'Honda Accord • LAG-567-ABJ',
  timeRange: '3:00 PM - 3:00 AM (12 hrs)',
  tripId: 'TRP-2026-102846'
};

export const MOCK_REQUEST_DETAILS = {
  extraHours: {
    type: 'Extra Hours',
    hours: '2 extra hours'
  },
  interstate: {
    type: 'Interstate Trip'
  },
  offDay: {
    type: 'Off Day'
  }
};


// TRIP DETAILS

export const MOCK_TRIP_DETAILS = {
  id: 'TRP-2026-102846',
  status: 'NOT STARTED',
  bannerMessage: 'Trip Not Started - Complete Pre-Ride Checklist',
  timeline: [
    { id: '1', title: 'Trip Assigned', state: 'completed' },
    { id: '2', title: 'Pre-Ride Checklist', state: 'current' },
    { id: '3', title: 'Client Pickup', state: 'upcoming' },
    { id: '4', title: 'Ongoing Ride', state: 'upcoming' },
    { id: '5', title: 'Trip Complete', state: 'upcoming' },
  ],
  client: {
    name: 'Dr. Amina Bello',
    phone: '+234 803 456 7890',
  },
  locations: {
    pickup: 'GTBank Headquarters, Victoria Island',
    dropoff: '65b Opebi Salvation, wema Bank, Ikeja',
  },
  vehicle: {
    model: 'Honda Accord',
    plate: 'LAG-567-ABJ',
  },
  booking: {
    type: 'CUSTOMER',
    rentalType: 'FULL DAY RENTAL',
    date: 'January 19, 2026',
    duration: '24 hrs',
    schedule: '2:00 PM - 2:00 AM',
  },
  itinerary: [
    'Pickup',
    'Drop at 65b Opebi Salvation, wema Bank, Ikeja',
    'Wait for meeting (2 hours)',
    'Return to GTBank Headquarters, Victoria Island',
  ]
};