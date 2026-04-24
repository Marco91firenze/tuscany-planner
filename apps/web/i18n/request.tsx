import { getRequestConfig } from "next-intl/server";
import { getDictionary } from "../lib/i18n";

export default getRequestConfig(async ({ locale }) => ({
  messages: await getDictionary(locale),
}));
