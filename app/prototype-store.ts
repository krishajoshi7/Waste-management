export type RequestStatus =
  | "request_created"
  | "collector_assigned"
  | "pickup_scheduled"
  | "pickup_completed"
  | "delivered_to_warehouse";

export type WasteRequest = {
  id: string;
  generator: string;
  address: string;
  wasteCategory: string;
  quantity: string;
  quantityType: "weight" | "bag_count";
  condition: "Clean" | "Mixed" | "Wet / Soiled" | "Soiled";
  urgency: "Normal" | "Urgent";
  notes: string;
  status: RequestStatus;
  collector: string;
  pickupWindow: string;
  actualQuantity?: string;
  warehouseStaff?: string;
  verifiedWeight?: string;
};

export type PrototypeState = {
  requests: WasteRequest[];
};

const STORE_KEY = "sustainable-ecg-prototype-state";

export const defaultPrototypeState: PrototypeState = {
  requests: [
    {
      id: "REQ-1024",
      generator: "Tharun Stitch Works",
      address: "14 Market Road, Anna Nagar",
      wasteCategory: "Cloth scraps",
      quantity: "18 kg",
      quantityType: "weight",
      condition: "Clean",
      urgency: "Urgent",
      notes: "Clean cotton scraps packed near the cutting table.",
      status: "pickup_scheduled",
      collector: "Arun V",
      pickupWindow: "Today, 2:00 PM - 4:00 PM"
    },
    {
      id: "REQ-1025",
      generator: "Lakshmi Temple Trust",
      address: "8 South Mada Street, Mylapore",
      wasteCategory: "Temple cloth",
      quantity: "7 bags",
      quantityType: "bag_count",
      condition: "Mixed",
      urgency: "Normal",
      notes: "Temple cloth collected after weekly sorting.",
      status: "collector_assigned",
      collector: "Divya S",
      pickupWindow: "Tomorrow, 9:00 AM - 11:00 AM"
    },
    {
      id: "REQ-1026",
      generator: "Asha Household",
      address: "3 Green Avenue, T Nagar",
      wasteCategory: "Sarees",
      quantity: "4 bags",
      quantityType: "bag_count",
      condition: "Clean",
      urgency: "Normal",
      notes: "Old sarees folded and ready for pickup.",
      status: "request_created",
      collector: "",
      pickupWindow: "Preferred evening"
    }
  ]
};

export function readPrototypeState(): PrototypeState {
  if (typeof window === "undefined") {
    return defaultPrototypeState;
  }

  const rawState = localStorage.getItem(STORE_KEY);

  if (!rawState) {
    writePrototypeState(defaultPrototypeState);
    return defaultPrototypeState;
  }

  try {
    return JSON.parse(rawState) as PrototypeState;
  } catch {
    writePrototypeState(defaultPrototypeState);
    return defaultPrototypeState;
  }
}

export function writePrototypeState(state: PrototypeState) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function createWasteRequest(
  request: Omit<WasteRequest, "id" | "status" | "collector">
) {
  const state = readPrototypeState();
  const nextRequest: WasteRequest = {
    ...request,
    id: `REQ-${Math.floor(2000 + Math.random() * 7000)}`,
    status: "request_created",
    collector: ""
  };

  writePrototypeState({
    requests: [nextRequest, ...state.requests]
  });

  return nextRequest;
}

export function assignCollector(requestId: string) {
  updateRequest(requestId, {
    collector: "Arun V",
    pickupWindow: "Today, 2:00 PM - 4:00 PM",
    status: "pickup_scheduled"
  });
}

export function completePickup(requestId: string, actualQuantity: string) {
  updateRequest(requestId, {
    actualQuantity,
    status: "pickup_completed"
  });
}

export function confirmWarehouseDelivery(
  requestId: string,
  verifiedWeight: string,
  warehouseStaff: string
) {
  updateRequest(requestId, {
    verifiedWeight,
    warehouseStaff,
    status: "delivered_to_warehouse"
  });
}

function updateRequest(requestId: string, patch: Partial<WasteRequest>) {
  const state = readPrototypeState();

  writePrototypeState({
    requests: state.requests.map((request) =>
      request.id === requestId ? { ...request, ...patch } : request
    )
  });
}

