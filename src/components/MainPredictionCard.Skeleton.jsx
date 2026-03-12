// src/components/MainPredictionCard.Skeleton.jsx
import React from 'react';

// This is a helper component to create a pulsing gray bar
// Updated to use the consistent card border variable for a subtle shimmer color
function Shimmer({ w, h = 'h-6', rounded = 'rounded' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700/50 ${rounded} ${w} ${h} animate-pulse`}
    ></div>
  );
}

export default function MainPredictionCardSkeleton() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 -mt-33 relative z-30 mb-8">
      <div className="rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl border bg-[var(--card)] border-[var(--card-border)] transition-all duration-300 overflow-hidden w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-start h-full">
          {/* COLUMN 1 */}
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex items-baseline gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1 animate-pulse"></span>
              <Shimmer w="w-24" h="h-5" />
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <Shimmer w="w-32 md:w-40 lg:w-48" h="h-16 md:h-20 lg:h-24" />
            </div>

            <div className="flex justify-center">
              <Shimmer w="w-64" h="h-12" rounded="rounded-lg" />
            </div>

            <div className="flex justify-between mt-4">
              <div className="space-y-2">
                <Shimmer w="w-40" h="h-4" />
                <Shimmer w="w-24" h="h-7" />
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <Shimmer w="w-16" h="h-4" />
                <Shimmer w="w-20" h="h-7" />
              </div>
            </div>

            {/* AQI Scale Bar Skeleton */}
            <div className="mt-6 w-full">
              <div className="flex justify-between text-[10px] md:text-xs font-medium px-1 flex-wrap gap-x-1 opacity-0">
                <span>Good</span>
                <span>Satisfactory</span>
                <span>Moderate</span>
                <span>Poor</span>
                <span>Very Poor</span>
                <span>Severe</span>
              </div>
              <div className="flex w-full h-2 rounded-full overflow-hidden mt-1 bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
              <div className="flex justify-between text-[10px] md:text-xs font-medium px-1 mt-1 flex-wrap gap-x-1 opacity-0">
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>401+</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2 (Empty equivalent to MaskMan) */}
          <div className="flex items-end justify-center w-full min-h-[160px] md:min-h-[200px] lg:min-h-[300px] mt-6 lg:mt-0">
            <Shimmer w="w-[160px] md:w-[220px] lg:w-[250px]" h="h-[160px] md:h-[220px] lg:h-[350px]" rounded="rounded-t-full" />
          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col justify-center items-center h-full pt-6 lg:pt-0 w-full">
            <div className="flex flex-col items-center text-center space-y-3">
              <Shimmer w="w-32 md:w-40" h="h-8 md:h-10" />
              <Shimmer w="w-48 md:w-56" h="h-10 md:h-12" />
            </div>

            <div className="mt-6 w-full flex justify-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                
                <div className="flex space-x-2">
                  <div className="w-16 h-10 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                  <div className="w-20 h-10 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                  <div className="w-20 h-10 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}