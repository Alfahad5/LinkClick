import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {  useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";



const Explore = () => {
  const {ref, inView} = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);  //in milli seconds (500)
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch || '');

  useEffect(()=> {
    if(inView && !searchValue) fetchNextPage();
    //with Infinte scrolling works
  },[inView,searchValue]);

  if(!posts){
    return (
      <div className="flex-center w-full  h-full">
        <Loader />
      </div>
    )
  }

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every((item) => item?.documents.length === 0 );

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Post</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg  bg-dark-4">
          <img 
           src="/assets/icons/search.svg" alt="search"
           width={24}
           height={24}
           />
           <Input type="text"
            placeholder="search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
           />
        </div>
      </div>

      <div className="flex-between w-full  max-w-5xl  mt-16 mb-7">
        <h3 className="body-bold md:h3-bold ">Popular today</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img 
           src="assets/icons/filter.svg"
           alt="filter"
           height={20}
           width={20}
           />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl ">
        { shouldShowSearchResults ?(
          <SearchResults 
           isSearchFetching= {isSearchFetching} 
           searchedPosts= {searchedPosts}
          /> 
          ) : shouldShowPosts ? (
            <p className="text-light-4 mt-10 text-center w-full">End of Posts</p>
            ) : posts.pages.map((item, index) =>(
              <GridPostList key={`page-${index}`} posts={item?.documents}  />
              // item.doc = posts on that specific page / item
            ))}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  )
}

export default Explore;