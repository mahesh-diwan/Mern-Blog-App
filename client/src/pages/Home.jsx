import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import PostCard from "../components/PostCard";
import useDocumentTitle from "../components/useDocumentTitle";

export default function Home() {
  useDocumentTitle('Home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/post/get-post");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return loading ? (
    <div className="flex justify-center items-center min-h-screen">
      <div className="spinner"></div>
    </div>
  ) : (
    <div>
      <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold lg:text-6xl" id="welcome">Welcome to my Blog</h1>
        <p className="text-gray-500 text-sm font-semibold">
          Here you'll find a variety of articles and tutorials on topics such as
          web development, software engineering, and programming languages.
        </p>
        <Link
          to="/search"
          className="text-sm text-teal-500 font-bold hover:underline"
        >
          View All Posts
        </Link>
      </div>


      <div className="mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl from-violet-600 to-blue-600 font-semibold text-center mb-4 recent-post">
              Recent Posts
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={"/search"}
              className="text-lg text-teal-500 text-center hover:underline"
            >
              View All Posts
            </Link>
          </div>
        )}
      </div>

      <div className="p-3 bg-amber-100 dark:bg-slate-700">
        <CallToAction />
      </div>
    </div>
  );
}
