import { yearOfTravel } from '../src/lib/savings.ts';

const check = (ok: boolean, label: string) => console.log(ok ? 'ok  ' : 'FAIL', label);

const three = yearOfTravel(21);
check(three.stays === 7, '3 weeks is 7 stays of 3 nights');
check(Math.abs(three.airbnb - 8700) < 150 && Math.abs(three.hostmenow - 4550) < 150, `3 weeks: Airbnb $${three.airbnb.toFixed(0)}, hostmenow $${three.hostmenow.toFixed(0)}`);
check(three.saved > 3900 && three.saved < 4400, `3 weeks saves about $${three.saved.toFixed(0)}`);
check(yearOfTravel(1).saved < 0, 'one night a year: the membership costs more than it saves');
check(yearOfTravel(5).saved > 0, 'using just the 5 free nights pays for the membership');
check(yearOfTravel(30).saved > yearOfTravel(21).saved, 'more travel, more saved');
