/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

type PagesFunction<E = Env> = import('@cloudflare/workers-types').PagesFunction<E>;
