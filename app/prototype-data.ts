export const mockStats = {
  openRequests: 14,
  awaitingAssignment: 5,
  scheduledToday: 8,
  completedToday: 6,
  urgentPickups: 3,
  warehousePending: 4
};

export const mockRequests = [
  {
    id: "REQ-1024",
    generator: "Tharun Stitch Works",
    wasteCategory: "Cloth scraps",
    quantity: "18 kg",
    urgency: "Urgent",
    status: "pickup_scheduled",
    collector: "Arun V",
    pickupWindow: "Today, 2:00 PM - 4:00 PM"
  },
  {
    id: "REQ-1025",
    generator: "Lakshmi Temple Trust",
    wasteCategory: "Temple cloth",
    quantity: "7 bags",
    urgency: "Normal",
    status: "collector_assigned",
    collector: "Divya S",
    pickupWindow: "Tomorrow, 9:00 AM - 11:00 AM"
  },
  {
    id: "REQ-1026",
    generator: "Asha Household",
    wasteCategory: "Sarees",
    quantity: "4 bags",
    urgency: "Normal",
    status: "request_created",
    collector: "",
    pickupWindow: "Preferred evening"
  },
  {
    id: "REQ-1027",
    generator: "Nila Boutique",
    wasteCategory: "Mixed fabric",
    quantity: "26 kg",
    urgency: "Urgent",
    status: "pickup_completed",
    collector: "Arun V",
    pickupWindow: "Today, 11:00 AM - 1:00 PM"
  }
];

export const mockAssignments = [
  {
    id: "ASN-221",
    generator: "Tharun Stitch Works",
    address: "14 Market Road, Anna Nagar",
    wasteCategory: "Cloth scraps",
    quantity: "18 kg",
    pickupWindow: "2:00 PM - 4:00 PM",
    status: "Navigate"
  },
  {
    id: "ASN-222",
    generator: "Lakshmi Temple Trust",
    address: "8 South Mada Street, Mylapore",
    wasteCategory: "Temple cloth",
    quantity: "7 bags",
    pickupWindow: "9:00 AM - 11:00 AM",
    status: "Start"
  },
  {
    id: "ASN-223",
    generator: "Nila Boutique",
    address: "22 Lake View Road, Adyar",
    wasteCategory: "Mixed fabric",
    quantity: "26 kg",
    pickupWindow: "11:00 AM - 1:00 PM",
    status: "Deliver"
  }
];

