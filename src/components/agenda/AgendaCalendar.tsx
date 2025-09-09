import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type AgendaItem = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: 'pending' | 'published' | 'failed';
};

type Props = {
  events: AgendaItem[];
};

export default function AgendaCalendar({ events }: Props) {
  // Mapear eventos para o formato do react-big-calendar
  const mappedEvents: Event[] = events.map(ev => ({
    title: ev.title + ' [' + ev.status + ']',
    start: ev.start,
    end: ev.end,
  }));

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
}
