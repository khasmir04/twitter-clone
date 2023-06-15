import InfiniteScroll from 'react-infinite-scroll-component'
import { ProfileImage } from './ProfileImage'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { VscHeartFilled, VscHeart } from 'react-icons/vsc'
import { IconHoverEffect } from './IconHoverEffect'
import { api } from '~/utils/api'

type Tweet = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  likedByMe: boolean
  user: {
    id: string
    image: string | null
    name: string | null
  }
}

type InfiniteTweetListProps = {
  isLoading: boolean
  isError: boolean
  hasMore: boolean | undefined
  fetchNewTweets: () => Promise<unknown>
  tweets?: Tweet[]
}

export const InfiniteTweetList = ({
  tweets,
  isError,
  isLoading,
  hasMore = false,
  fetchNewTweets,
}: InfiniteTweetListProps): JSX.Element | null => {
  if (isLoading) return <h1>Loading...</h1>
  if (isError) return <h1>Error...</h1>

  if (tweets == null || tweets.length === 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">
        No tweets found
      </h2>
    )
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNewTweets}
        hasMore={hasMore}
        loader={'Loading...'}
      >
        {tweets.map((tweet) => {
          return <TweetCard key={tweet.id} {...tweet} />
        })}
      </InfiniteScroll>
    </ul>
  )
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
})

const TweetCard = ({
  id,
  content,
  createdAt,
  likeCount,
  likedByMe,
  user,
}: Tweet) => {
  const trpcUtils = api.useContext()
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<typeof trpcUtils.tweet.infiniteFeed.setInfiniteData>[1] = (oldData) => {
        if (oldData == null) return

        const countModifier = addedLike ? 1 : -1

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map(tweet => {
                if (tweet.id === id) {
                  return {
                    ...tweet,
                    likeCount: tweet.likeCount + countModifier,
                    likedByMe: addedLike
                  }
                }

                return tweet
              })
            }
          })
        }
      }
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData)
    }
  })

  const handleToggleLike = () => {
    toggleLike.mutate({ id })
  }

  return (
    <li className="flex gap-4 border px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      </div>
    </li>
  )
}

type HeartButtonProps = {
  likedByMe: boolean
  likeCount: number
  isLoading: boolean
  onClick: () => void
}

const HeartButton = ({
  likedByMe,
  likeCount,
  isLoading,
  onClick,
}: HeartButtonProps) => {
  const session = useSession()
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

  const textClasses = likedByMe
    ? 'text-red-500'
    : 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'

  const iconClasses = likedByMe
    ? 'fill-red-500'
    : 'fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500'

  if (session.status !== 'authenticated')
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    )
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group ml-2 flex items-center gap-1 self-start transition-colors
        duration-200 ${textClasses}`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${iconClasses}`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  )
}
