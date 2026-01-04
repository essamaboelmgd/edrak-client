type Params = {
  price: number;
  discount: number;
  start_date: string | Date;
  end_date: string | Date;
};

export default function getPrice(params: Params) {
  const { price, discount, start_date, end_date } = params;

  if (start_date && end_date) {
    const today = Date.now();
    const start = new Date(start_date).getTime();
    const end = new Date(end_date).getTime();

    if (start <= today && end >= start && end >= today) {
      return discount;
    } else {
      return price;
    }
  } else {
    return price;
  }
}
