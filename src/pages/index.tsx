import { type NextPage } from 'next'
import { NewTweetForm } from '~/components/NewTweetForm'
import { InfiniteTweetList } from '~/components/InfiniteTweetList'
import { api } from '~/utils/api'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

const TABS = ['Recent', 'Following'] as const

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>('Recent')
  const session = useSession()

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {session.status === 'authenticated' && (
          <div className="flex">
            {TABS.map((tab) => {
              const tabClasses =
                tab === selectedTab
                  ? 'border-b-4 border-b-blue-500 font-bold'
                  : ''
              return (
                <button
                  key={tab}
                  className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${tabClasses}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        )}
      </header>
      <NewTweetForm />
      {selectedTab === 'Recent' ? <RecentTweets /> : <FollowingTweets />}
    </>
  )
}

const RecentTweets = (): JSX.Element => {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {
      // TODO: Change limit depending on screen size
      limit: 12,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  )
}

const FollowingTweets = (): JSX.Element => {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {
      onlyFollowing: true,
      // TODO: Change limit depending on screen size
      limit: 12,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )
  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  )
}

export default Home
