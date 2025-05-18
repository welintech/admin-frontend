// cashfree.js
import { load } from '@cashfreepayments/cashfree-js';

const mode =
  import.meta.env.VITE_REACT_ENV === 'production' ? 'production' : 'sandbox';

let cashfreeInstance;

const initializeSDK = async () => {
  if (!cashfreeInstance) {
    cashfreeInstance = await load({ mode });
  }
  return cashfreeInstance;
};

export default initializeSDK;
