import { Button, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DashboardComp() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, postsRes, commentsRes] = await Promise.all([
          fetch("/api/user/get-users?limit=5"),
          fetch("/api/post/get-post?limit=5"),
          fetch("/api/comment/get-comments?limit=5")
        ]);
  
        const [userData, postsData, commentsData] = await Promise.all([
          usersRes.json(),
          postsRes.json(),
          commentsRes.json()
        ]);
  
        if (usersRes.ok) {
          setUsers(userData.users);
          setTotalUsers(userData.totalUsers);
          setLastMonthUsers(userData.lastMonthUsers);
        }
  
        if (postsRes.ok) {
          setPosts(postsData.posts);
          setTotalPosts(postsData.totalPosts);
          setLastMonthPosts(postsData.lastMonthPosts);
        }
  
        if (commentsRes.ok) {
          setComments(commentsData.comments);
          setTotalComments(commentsData.totalComments);
          setLastMonthComments(commentsData.lastMonthComments);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (currentUser.isAdmin) {
      fetchData();
    }
  }, [currentUser]);
  
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen w-full">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="p-3 md:mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div className="">
                  <h3 className="text-gray-500 text-md uppercase">
                    Total Users
                  </h3>
                  <p className="text-2xl">{totalUsers}</p>
                </div>
                <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <HiArrowNarrowUp />
                  {lastMonthUsers}
                </span>
                <div className="text-gray-500">Last Month</div>
              </div>
            </div>

            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div className="">
                  <h3 className="text-gray-500 text-md uppercase">
                    Total Posts
                  </h3>
                  <p className="text-2xl">{totalPosts}</p>
                </div>
                <HiAnnotation className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <HiArrowNarrowUp />
                  {lastMonthPosts}
                </span>
                <div className="text-gray-500">Last Month</div>
              </div>
            </div>

            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <div className="flex justify-between">
                <div className="">
                  <h3 className="text-gray-500 text-md uppercase">
                    Total Comments
                  </h3>
                  <p className="text-2xl">{totalComments}</p>
                </div>
                <HiDocumentText className="bg-lime-600 text-white rounded-full text-5xl p-3 shadow-lg" />
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <HiArrowNarrowUp />
                  {lastMonthComments}
                </span>
                <div className="text-gray-500">Last Month</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
            <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
              <div className="flex justify-between p-3 text-sm font-semibold">
                <h1 className="text-center p-2">Recent Users</h1>
                <Link to={"/dashboard?tab=users"}>
                  <Button gradientDuoTone={"purpleToPink"} outline>
                    See All
                  </Button>
                </Link>
              </div>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>User Image</Table.HeadCell>
                  <Table.HeadCell>User Name</Table.HeadCell>
                </Table.Head>
                {users &&
                  users.map((user) => (
                    <Table.Body className="divide-y" key={user._id}>
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>
                          <img
                            className="w-10 h-10 rounded-full bg-gray-500"
                            src={user.profilePicture}
                            alt={user.username}
                          />
                        </Table.Cell>
                        <Table.Cell>{user.username}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
              </Table>
            </div>

            <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
              <div className="flex justify-between p-3 text-sm font-semibold">
                <h1 className="text-center p-2">Recent Comments</h1>
                <Link to={"/dashboard?tab=comments"}>
                  <Button gradientDuoTone={"purpleToPink"} outline>
                    See All
                  </Button>
                </Link>
              </div>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Comment</Table.HeadCell>
                  <Table.HeadCell>Likes</Table.HeadCell>
                </Table.Head>
                {comments &&
                  comments.map((comment) => (
                    <Table.Body className="divide-y" key={comment._id}>
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="w-96">
                          <p className="line-clamp-2">{comment.content}</p>
                        </Table.Cell>
                        <Table.Cell>{comment.numberOfLikes}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
              </Table>
            </div>

            <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
              <div className="flex justify-between p-3 text-sm font-semibold">
                <h1 className="text-center p-2">Recent Posts</h1>
                <Link to={"/dashboard?tab=posts"}>
                  <Button gradientDuoTone={"purpleToPink"} outline>
                    See All
                  </Button>
                </Link>
              </div>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Post Image</Table.HeadCell>
                  <Table.HeadCell>Post Title</Table.HeadCell>
                  <Table.HeadCell>Category</Table.HeadCell>
                </Table.Head>
                {posts &&
                  posts.map((post) => (
                    <Table.Body className="divide-y" key={post._id}>
                      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>
                          <img
                            className="w-14 h-10 rounded-md bg-gray-500"
                            src={post.image}
                            alt={post.title}
                          />
                        </Table.Cell>
                        <Table.Cell className="w-96">{post.title}</Table.Cell>
                        <Table.Cell className="w-5">{post.category}</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
