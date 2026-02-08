import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Tractor, Users, MapPin, BadgeCheck } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const goToRole = (role: string) => {
    navigate(`/select-role?role=${role}`);
  };

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
            Trusted rural marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-bold display-font text-gray-900">
            Farmer–Labour–Machine Finder
          </h1>
          <p className="text-lg text-gray-700">
            Post farm work, hire skilled labour, or rent machines with secure, escrow-style payments and clear job tracking.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => goToRole('farmer')}
              className="primary-btn"
            >
              Post Farm Work
            </button>
            <button
              onClick={() => goToRole('labourer')}
              className="px-4 py-3 rounded-lg border border-gray-300 bg-white font-semibold"
            >
              Find Labour
            </button>
            <button
              onClick={() => goToRole('machine_owner')}
              className="px-4 py-3 rounded-lg border border-gray-300 bg-white font-semibold"
            >
              Rent Machines
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MessageCircle className="w-4 h-4" />
            Chatbot guidance in simple language
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-700" />
            <div>
              <p className="font-semibold">Role-based dashboards</p>
              <p className="text-sm text-gray-600">Dedicated screens for Farmers, Labourers, and Machine Owners.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tractor className="w-6 h-6 text-green-700" />
            <div>
              <p className="font-semibold">Machines with deposits</p>
              <p className="text-sm text-gray-600">Rental + refundable deposit tracked in one flow.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-700" />
            <div>
              <p className="font-semibold">Escrow-style payments</p>
              <p className="text-sm text-gray-600">Funds released only after completion confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Post work or request a machine', icon: MapPin },
          { title: 'Get matched & accept the request', icon: Users },
          { title: 'Pay securely, confirm completion', icon: BadgeCheck }
        ].map(step => (
          <div key={step.title} className="bg-white rounded-lg border border-gray-200 p-6">
            <step.icon className="w-6 h-6 text-green-700" />
            <p className="mt-3 font-semibold text-gray-900">{step.title}</p>
            <p className="text-sm text-gray-600 mt-2">Simple steps designed for rural users.</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ShieldCheck className="w-6 h-6 text-green-700" />
          <p className="mt-3 font-semibold text-gray-900">Verified phone badges</p>
          <p className="text-sm text-gray-600 mt-2">Build trust with visible verification.</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <BadgeCheck className="w-6 h-6 text-green-700" />
          <p className="mt-3 font-semibold text-gray-900">Ratings & reviews</p>
          <p className="text-sm text-gray-600 mt-2">Rate after payment release to keep quality high.</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <MessageCircle className="w-6 h-6 text-green-700" />
          <p className="mt-3 font-semibold text-gray-900">Chatbot support</p>
          <p className="text-sm text-gray-600 mt-2">Instant help for payments and job flow.</p>
        </div>
      </section>
    </div>
  );
}


