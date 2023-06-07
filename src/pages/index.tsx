import { type NextPage } from 'next'
import { NewTweetForm } from '~/components/NewTweetForm'
import { InfiniteTweetList } from '~/components/InfiniteTweetList'
import { api } from '~/utils/api'

const Home: NextPage = () => {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
      </header>
      <NewTweetForm />
      <RecentTweets />
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

export default Home
