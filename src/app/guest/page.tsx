import { getSession } from "@/lib/session";
import { getGuestPortalData } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { differenceInCalendarDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function GuestPage() {
  const session = await getSession();
  const stayData = await getGuestPortalData(session.userId);

  if (!stayData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <img
          src="/assets/icon-guest.svg"
          alt="Guest"
          width={80}
          height={80}
          className="mb-6 opacity-60"
        />
        <h1 className="font-heading text-navy text-2xl font-bold mb-2 text-center">
          No Active Stay Found
        </h1>
        <p className="text-slate text-center max-w-sm">
          If you&apos;ve just checked in, please wait a moment and refresh the
          page. Your stay information will appear here once processing is
          complete.
        </p>
      </div>
    );
  }

  const { guest, slip, charges, showerTokens, showerTokensUsed } = stayData;
  const remaining = showerTokens - showerTokensUsed;
  const nightsRemaining = differenceInCalendarDays(
    new Date(stayData.expectedDeparture),
    new Date()
  );
  const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Banner */}
      <img
        src="/assets/guest-welcome.png"
        alt="Welcome to Sunset Harbor Marina"
        className="w-full h-48 object-cover rounded-xl mb-6"
      />

      {/* Welcome */}
      <h1 className="font-heading text-navy text-2xl font-bold mb-1">
        Welcome to Sunset Harbor
      </h1>
      <p className="text-slate mb-6">
        {guest.name} &mdash; {guest.vesselName}
      </p>

      {/* Stay Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img
              src="/assets/icon-slip.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Your Slip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-heading text-3xl font-bold text-ocean">
              {slip?.name ?? "Unassigned"}
            </span>
            {slip && (
              <Badge variant="outline" className="text-slate">
                {slip.size}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="text-slate">Check-in</span>
              <p className="font-medium text-navy">
                {formatDate(stayData.checkIn)}
              </p>
            </div>
            <div>
              <span className="text-slate">Expected departure</span>
              <p className="font-medium text-navy">
                {formatDate(stayData.expectedDeparture)}
              </p>
            </div>
            <div className="col-span-2 mt-1">
              <span className="text-slate">
                {nightsRemaining > 0
                  ? `${nightsRemaining} night${nightsRemaining !== 1 ? "s" : ""} remaining`
                  : "Departing today"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img
              src="/assets/icon-gate.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Access Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-navy/5 rounded-lg py-4">
          {/* Gate Code */}
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/assets/icon-gate.svg"
              alt=""
              width={18}
              height={18}
              className="opacity-60"
            />
            <span className="text-xs text-slate uppercase tracking-wide">
              Gate Code
            </span>
          </div>
          <p className="font-mono text-2xl text-navy font-bold mb-4 ml-[30px]">
            {stayData.gateCode ?? "N/A"}
          </p>

          <Separator className="mb-4" />

          {/* Wi-Fi Password */}
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/assets/icon-wifi.svg"
              alt=""
              width={18}
              height={18}
              className="opacity-60"
            />
            <span className="text-xs text-slate uppercase tracking-wide">
              Wi-Fi Password
            </span>
          </div>
          <p className="font-mono text-xl text-navy mb-4 ml-[30px]">
            {stayData.wifiPassword ?? "N/A"}
          </p>

          <Separator className="mb-4" />

          {/* Shower Tokens */}
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/assets/icon-token.svg"
              alt=""
              width={18}
              height={18}
              className="opacity-60"
            />
            <span className="text-xs text-slate uppercase tracking-wide">
              Shower Tokens
            </span>
          </div>
          <p className="font-mono text-lg text-navy ml-[30px]">
            {remaining} of {showerTokens} remaining
          </p>
        </CardContent>
      </Card>

      {/* Charges Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img
              src="/assets/icon-receipt.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Current Charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {charges.length === 0 ? (
            <p className="text-slate italic">No charges yet</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {charges.map((charge) => (
                  <li
                    key={charge.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-navy">{charge.description}</span>
                    <span className="font-mono text-navy">
                      {formatCurrency(charge.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator className="mb-3" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-navy">Total</span>
                <span className="font-heading text-xl font-bold text-navy">
                  {formatCurrency(totalCharges)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
