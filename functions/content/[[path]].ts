export const onRequest: PagesFunction = async ({ params }) => {
  const path = (params.path as string[]).join('/');
  const res = await fetch(`https://arrivals.llll-ll.com/content/${path}`);
  return new Response(res.body, { status: res.status, headers: res.headers });
};
