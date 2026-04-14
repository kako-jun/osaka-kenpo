export const onRequest: PagesFunction = async ({ params }) => {
  const app = 'osaka-kenpo';
  const segments = params.path as string[] | undefined;
  const path = segments?.length ? segments.join('/') : `${app}/ja/`;
  const url = `https://arrivals.llll-ll.com/${path}`;

  const res = await fetch(url);
  return new Response(res.body, { status: res.status, headers: res.headers });
};
