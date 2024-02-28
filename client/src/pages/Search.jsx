import { Button, Select, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import "../../public/stylesheets/spinner.css";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMoreLoading, setShowMoreLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");

    if (searchTermFromUrl || sortFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl,
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/post/get-post?${searchQuery}`);
        if (!res.ok) {
          setLoading(false);
          return;
        } else if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
          setLoading(false);
          if (data.posts.length === 9) {
            setShowMore(true);
          }
        }
      } catch (error) {}
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    } else if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    } else if (e.target.id === "category") {
      const category = e.target.value || "uncategorized";
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    try {
      setShowMoreLoading(true);
      const numberOfPosts = posts.length;
      const startIndex = numberOfPosts;
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("startIndex", startIndex);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/post/get-post?${searchQuery}`);
      if (!res.ok) {
        return;
      } else if (res.ok) {
        const data = await res.json();
        setPosts([...posts, ...data.posts]);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowMoreLoading(false);
    }
  };
  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center gap-2">
            <label className="whitespace-nowrap font-semibold" htmlFor="">
              Search Term
            </label>
            <TextInput
              className="w-44"
              placeholder="Search"
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-between items-center gap-2">
            <label className="whitespace-nowrap font-semibold" htmlFor="">
              Sort
            </label>
            <Select
              className="w-44"
              onChange={handleChange}
              value={sidebarData.sort}
              id="sort"
            >
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex justify-between items-center gap-2">
            <label className="whitespace-nowrap font-semibold" htmlFor="">
              Category
            </label>
            <Select
              className="w-44"
              onChange={handleChange}
              value={sidebarData.category}
              id="category"
            >
              <option value="uncategorized">Uncategorized</option>
              <option value="javascript">Javascript</option>
              <option value="reactjs">ReactJs</option>
              <option value="nextjs">NextJs</option>
            </Select>
          </div>
          <Button type="submit" gradientDuoTone={"purpleToPink"} outline>
            Search
          </Button>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-700 p-3 mt-5 text-center">
          Post Result
        </h1>
        <div className="p-7 flex flex-wrap justify-center gap-4">
          {!loading && posts.length === 0 && (
            <div className="flex justify-center items-center min-h-screen w-full">
              <p className="text-xl text-gray-500 ">No posts found</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center min-h-screen w-full">
              <div className="spinner"></div>
            </div>
          )}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
        {!loading && showMore && (
          <div className="flex w-full justify-center items-center">
            <button
              className="my-7 text-teal-500 font-semibold hover:underline transition-all"
              onClick={handleShowMore}
            >
              Show More
            </button>
          </div>
        )}

        {
            !loading && showMoreLoading && (
                <div className="flex my-4 justify-center w-full">
                    <Spinner/>
                </div>
            )
        }
      </div>
    </div>
  );
}
