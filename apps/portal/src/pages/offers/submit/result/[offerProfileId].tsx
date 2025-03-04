import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button, Spinner } from '@tih/ui';

import type { BreadcrumbStep } from '~/components/offers/Breadcrumb';
import { Breadcrumbs } from '~/components/offers/Breadcrumb';
import OffersProfileSave from '~/components/offers/offersSubmission/OffersProfileSave';
import OffersSubmissionAnalysis from '~/components/offers/offersSubmission/OffersSubmissionAnalysis';

import { getProfilePath } from '~/utils/offers/link';
import { trpc } from '~/utils/trpc';

import type { ProfileAnalysis } from '~/types/offers';

export default function OffersSubmissionResult() {
  const router = useRouter();
  let { offerProfileId, token = '' } = router.query;
  offerProfileId = offerProfileId as string;
  token = token as string;
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () =>
    pageRef.current?.scrollTo({ behavior: 'smooth', top: 0 });

  // TODO: Check if the token is valid before showing this page
  const getAnalysis = trpc.useQuery(
    ['offers.analysis.get', { profileId: offerProfileId }],
    {
      onSuccess(data) {
        setAnalysis(data);
      },
    },
  );

  const steps = [
    <OffersProfileSave key={0} profileId={offerProfileId} token={token} />,
    <OffersSubmissionAnalysis
      key={1}
      analysis={analysis}
      isError={getAnalysis.isError}
      isLoading={getAnalysis.isLoading}
    />,
  ];

  const breadcrumbSteps: Array<BreadcrumbStep> = [
    {
      label: 'Offers',
    },
    {
      label: 'Background',
    },
    {
      label: 'Save profile',
      step: 0,
    },
    {
      label: 'Analysis',
      step: 1,
    },
  ];

  useEffect(() => {
    scrollToTop();
  }, [step]);

  return (
    <>
      {getAnalysis.isLoading && (
        <div className="flex h-screen w-screen">
          <div className="m-auto mx-auto w-screen justify-center">
            <Spinner display="block" size="lg" />
            <div className="text-center">Loading...</div>
          </div>
        </div>
      )}
      {!getAnalysis.isLoading && (
        <div ref={pageRef} className="fixed h-full w-full overflow-y-scroll">
          <div className="mb-20 flex justify-center">
            <div className="my-5 block w-full max-w-screen-md rounded-lg bg-white py-10 px-10 shadow-lg">
              <div className="mb-4 flex justify-end">
                <Breadcrumbs
                  currentStep={step}
                  setStep={setStep}
                  steps={breadcrumbSteps}
                />
              </div>
              {steps[step]}
              {step === 0 && (
                <div className="flex justify-end">
                  <Button
                    disabled={false}
                    icon={ArrowRightIcon}
                    label="Next"
                    variant="secondary"
                    onClick={() => setStep(step + 1)}
                  />
                </div>
              )}
              {step === 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    addonPosition="start"
                    icon={ArrowLeftIcon}
                    label="Previous"
                    variant="secondary"
                    onClick={() => setStep(step - 1)}
                  />
                  <Button
                    href={getProfilePath(
                      offerProfileId as string,
                      token as string,
                    )}
                    icon={EyeIcon}
                    label="View your profile"
                    variant="primary"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
