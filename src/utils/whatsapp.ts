export const generateWhatsAppLink = (phoneNumber: string, productUrl: string) => {
  // Normalize Egyptian numbers to international if they start with 01
  let normalizedPhone = phoneNumber.replace(/\D/g, '');
  if (normalizedPhone.startsWith('01')) {
    normalizedPhone = '20' + normalizedPhone.substring(1);
  }

  const message = `السلام عليكم، كنت عايز أستفسر عن المنتج ده:
رابط المنتج: ${productUrl}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
};
