import { Models } from "appwrite"
import { useEffect, useState } from "react"
import Loader from "./Loader";

import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations"
import { checkIsLiked } from "@/lib/utils";


type PostStatsProps = {
    post?: Models.Document,
    userId: string
}

const PostStats = ({post, userId}: PostStatsProps) => {

    // const location = useLocation();
    const likesList = post?.likes.map((user: Models.Document) => user.$id)

    const [likes, setLikes] = useState<string[]>(likesList);
    const [isSaved, setIsSaved] = useState(false);

    const {mutate: likePost} = useLikePost();
    const {mutate: savePost, isPending: isSavingPost} = useSavePost();
    const {mutate: deleteSavedPost, isPending: isDeletingSaved} = useDeleteSavedPost();

    const {data: currentUser} = useGetCurrentUser();

    const savedPostRecord = currentUser?.save.find(
        (record: Models.Document) => record.post.$id === post?.$id
      );

    useEffect(() => {
        setIsSaved(!!savedPostRecord);
        // !! automatic boolean i.e. "? T:F" Ternary operation
        // basically a double complement (not operation)
        // empty '' is considered false.
    }, [currentUser]);
    
    const  handleLikePost= (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();

        let newlikes = [...likes]; 
        //spread of all the previous likes

        const hasLiked= newlikes.includes(userId);

        if(hasLiked){
            newlikes= newlikes.filter((id) => id!== userId);
        }else{
            newlikes.push(userId);
        }

        setLikes(newlikes);
        likePost({ postId: post?.$id || '', likesArray: newlikes});

    }

    const handleSavePost = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();
        // console.log(savedPostRecord.$id);
        
        if(savedPostRecord){ //already saved?
            setIsSaved(false);
            return deleteSavedPost(savedPostRecord.$id);
            // unsaves if clicked again
        }

        savePost({userId: userId, postId: post?.$id || ''});
        setIsSaved(true);
        //bookmarks post
    }

  return (
    <div className="flex justify-between z-20 items-center">
        <div className="flex gap-2 mr-5">
            <img 
            src={ checkIsLiked(likes, userId)
            ? '/assets/icons/liked.svg' :
             '/assets/icons/like.svg'}  
             alt="like"
             height={20}
             width={20}
             onClick={(e) => handleLikePost(e)}
             className="cursor-pointer"
             />
             <p className="small-medium lg:base-medium">{likes.length}</p>
        </div>

        <div className="flex gap-2 ">
        { isDeletingSaved|| isSavingPost 
            ? <Loader/> 
            : <img 
             src={isSaved
               ?'/assets/icons/saved.svg'
               :'/assets/icons/save.svg'
            }
             alt="save"
             height={20}
             width={20}
             onClick={(e) => handleSavePost(e)}

             />
        }
             
        </div>
    </div>
  )
}

export default PostStats;