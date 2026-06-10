import { useTranslations } from "next-intl";

import { richTags } from "@/i18n/rich";

// Presentational stub — the real intake submission (writes to intake_submissions
// + emails moderators via Resend) is a Phase 2 deliverable. Fields are inert.
export function Intake() {
  const t = useTranslations("intake");
  const audience = t.raw("audience") as string[];
  const circuitOptions = t.raw("form.circuitOptions") as string[];
  const roleOptions = t.raw("form.roleOptions") as string[];

  const labelClass =
    "mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted";
  const fieldClass =
    "w-full rounded-xs border-[1.5px] border-ink-line bg-cream px-4 py-3.5 text-[15px] text-ink";

  return (
    <section id="report" className="bg-cream px-8 py-25 max-[720px]:px-5 max-[720px]:py-15">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[0.9fr_1.1fr] items-start gap-15 max-[1080px]:grid-cols-1 max-[1080px]:gap-10">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-rojo">
            <span className="font-medium text-ink-faint">04</span>
            {t("label")}
          </div>
          <h3 className="mb-5 font-display text-[clamp(36px,4vw,48px)] font-medium leading-[1.02] tracking-[-0.03em] [&_em]:italic [&_em]:text-rojo">
            {t.rich("title", richTags)}
          </h3>
          <p className="text-[15px] leading-[1.65] text-ink-muted">{t("intro")}</p>
          <ul className="mt-6 list-none border-t border-ink-line pt-6">
            {audience.map((item) => (
              <li
                key={item}
                className="flex gap-3 py-2.5 text-sm before:font-bold before:text-rojo before:content-['→']"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <form className="rounded-xs border border-ink-line-strong bg-cream-deep p-9 max-[720px]:p-6">
          <div className="grid grid-cols-2 gap-3.5 max-[720px]:grid-cols-1">
            <div className="mb-[18px]">
              <label className={labelClass}>{t("form.name")}</label>
              <input type="text" disabled className={fieldClass} />
            </div>
            <div className="mb-[18px]">
              <label className={labelClass}>{t("form.contact")}</label>
              <input type="text" disabled className={fieldClass} />
            </div>
          </div>
          <div className="mb-[18px]">
            <label className={labelClass}>{t("form.circuit")}</label>
            <select disabled className={fieldClass}>
              <option>{t("form.choose")}</option>
              {circuitOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="mb-[18px]">
            <label className={labelClass}>{t("form.role")}</label>
            <select disabled className={fieldClass}>
              <option>{t("form.choose")}</option>
              {roleOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="mb-[18px]">
            <label className={labelClass}>{t("form.message")}</label>
            <textarea disabled className={`${fieldClass} min-h-[110px] resize-y`} />
          </div>
          <button
            type="button"
            disabled
            className="mt-2 w-full rounded-xs bg-rojo px-8 py-[18px] text-sm font-bold uppercase tracking-[0.14em] text-cream"
          >
            {t("form.submit")}
          </button>
          <p className="mt-3.5 text-center text-xs leading-[1.5] text-ink-faint">
            {t("form.note")}
          </p>
        </form>
      </div>
    </section>
  );
}
