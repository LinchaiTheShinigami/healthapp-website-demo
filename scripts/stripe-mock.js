(function () {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomId = () => Math.random().toString(36).slice(2, 8);

  const createPaymentIntent = async ({ amount, currency, receiptEmail }) => {
    await delay(500);
    const id = `pi_mock_${Date.now()}_${randomId()}`;
    return {
      id,
      clientSecret: `${id}_secret_${randomId()}`,
      amount,
      currency,
      receiptEmail
    };
  };

  const confirmCardPayment = async (clientSecret, paymentDetails) => {
    await delay(650);
    return {
      status: 'succeeded',
      paymentIntent: {
        id: clientSecret.split('_secret_')[0],
        status: 'succeeded',
        paymentDetails
      }
    };
  };

  window.AyutaStripeMock = {
    createPaymentIntent,
    confirmCardPayment
  };
})();
