import { redirect } from 'next/navigation';

/**
 * The parliament story now lives as a microsite at
 * /politics/parliament-party-seats/. This route keeps the URL it was first
 * shared under working. A static export cannot send an HTTP redirect, so
 * Next writes a page that redirects in the browser instead.
 */
export default function ParliamentPartySeatsRedirect(): never {
  redirect('/politics/parliament-party-seats/');
}
