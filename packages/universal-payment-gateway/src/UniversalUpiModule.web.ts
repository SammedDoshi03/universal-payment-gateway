export default {
  initiatePayment(uriString: string): Promise<string> {
    return Promise.reject(new Error("initiatePayment is not available on web directly."));
  }
};
