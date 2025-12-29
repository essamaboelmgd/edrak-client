import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtl from "stylis-plugin-rtl";
import { ReactNode } from "react";

// NB: A unique `key` is important for it to work!
const options = {
  rtl: { key: "css-ar", stylisPlugins: [rtl] },
  ltr: { key: "css-en" },
};

export function RtlProvider({ children }: { children: ReactNode }) {
  const cache = createCache(options.rtl);
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}



