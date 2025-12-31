import { Order } from '@/store/useStore';

// Simulate live order status updates (like Uber/Pick n Pay ASAP)
export const simulateOrderUpdates = (
  order: Order,
  onUpdate: (updates: Partial<Order>) => void,
  onComplete: () => void
): (() => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let currentStatus = order.status;
  let elapsedTime = 0;
  const totalDuration = order.estimatedDelivery 
    ? order.estimatedDelivery.getTime() - order.createdAt.getTime() 
    : 25 * 60 * 1000; // 25 minutes default

  const statusSequence: Order['status'][] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'picked',
    'delivering',
    'delivered'
  ];

  const updateOrder = () => {
    const progress = Math.min(elapsedTime / totalDuration, 1);
    const statusIndex = Math.floor(progress * (statusSequence.length - 1));
    const newStatus = statusSequence[statusIndex];

    if (newStatus !== currentStatus) {
      currentStatus = newStatus;
      
      // Calculate updated estimated delivery time (countdown)
      const remainingTime = Math.max(0, totalDuration - elapsedTime);
      const updatedEstimatedDelivery = new Date(Date.now() + remainingTime);
      
      onUpdate({
        status: newStatus,
        estimatedDelivery: updatedEstimatedDelivery,
      });

      // If delivered, complete the updates
      if (newStatus === 'delivered') {
        onComplete();
        return;
      }
    }

    // Continue updating every 5 seconds
    elapsedTime += 5000;
    if (elapsedTime < totalDuration && currentStatus !== 'delivered') {
      timeoutId = setTimeout(updateOrder, 5000);
    } else if (currentStatus === 'delivered') {
      onComplete();
    }
  };

  // Start updates after 2 seconds
  timeoutId = setTimeout(updateOrder, 2000);

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

// Format estimated delivery time for display
export const formatEstimatedDelivery = (estimatedDelivery?: Date): string => {
  if (!estimatedDelivery) return 'Calculating...';
  
  const now = new Date();
  const diff = estimatedDelivery.getTime() - now.getTime();
  
  if (diff <= 0) return 'Arriving now';
  
  const minutes = Math.ceil(diff / (1000 * 60));
  
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};



