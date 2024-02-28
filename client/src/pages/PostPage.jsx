import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../public/stylesheets/spinner.css";
import { Button } from "flowbite-react";
import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/get-post?slug=${postSlug}`, {
          method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
        } else if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(null);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch("/api/post/get-post?limit=3");
        if (!res.ok) {
          throw new Error("Failed to fetch recent posts");
        }
        const data = await res.json();
        setRecentPosts(data.posts);
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    };

    fetchRecentPosts();
  }, []);

  return loading ? (
    <div className="flex justify-center items-center min-h-screen">
      <div className="spinner"></div>
    </div>
  ) : (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        className="self-center mt-5"
        to={`/search?category=${post && post.category}`}
      >
        <Button className="" color="gray" pill size={"xs"}>
          {post && post.category}
        </Button>
      </Link>
      <img
        className="mt-10 max-h-[600px] w-full object-cover rounded-xl"
        src={post && post.image}
        alt={post && post.title}
      />
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {post && post.content.length < 1000
            ? "1"
            : (post.content.length / 1000).toFixed(0)}{" "}
          mins read
        </span>
      </div>

      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <div className="max-w-4xl mx-auto w-full">
        <CallToAction />
      </div>
      <CommentSection postId={post._id} />
      <div className="flex flex-col justify-center items-center mb-1">
        <h1 className="text-2xl mt-5 font-sans font-medium">Recent Articles</h1>
        <div className="flex flex-wrap w-full sm:w-screen gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
}
