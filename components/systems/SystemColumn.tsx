import { SYSTEMS } from '@/lib/content';
import { serviceMessage, whatsappUrl } from '@/lib/whatsapp';
import { IconArrowRight, IconWhatsApp, SYSTEM_ICONS } from '@/components/ui/Icons';

type System = (typeof SYSTEMS)[number];

/** Una columna (sistema) del panel de servicios. Componente de servidor. */
export default function SystemColumn({ system, i }: { system: System; i: number }) {
  const Icon = SYSTEM_ICONS[system.id];
  return (
    <li className="sys-col" data-col={i} data-sys={system.id}>
      <div className="sys-col-head">
        <p className="t-label whitespace-nowrap text-ink-3">
          <span className="text-ink">{system.index}</span>
          <span aria-hidden="true" className="sys-col-dash" />
          {system.system}
        </p>
        <Icon size={24} className="sys-col-icon" />
      </div>

      <h3 className="sys-col-title t-title">{system.name}</h3>

      <p className="sys-col-line">{system.line}</p>

      <ul className="sys-svc" aria-label={`Servicios de ${system.label.toLowerCase()}`}>
        {system.services.map((s) => (
          <li key={s} className="sys-svc-item">
            <span aria-hidden="true" className="sys-svc-node" />
            {s}
          </li>
        ))}
      </ul>

      <div className="sys-col-cta">
        <a
          href={whatsappUrl(serviceMessage(system.id))}
          target="_blank"
          rel="noopener noreferrer"
          className="link-arrow sys-col-link"
        >
          <IconWhatsApp size={18} className="sys-col-wa" />
          <span>Solicitar servicio</span>
          <span className="sr-only"> de {system.whatsappLabel} (se abre WhatsApp)</span>
          <IconArrowRight size={18} />
        </a>
      </div>
    </li>
  );
}
