import { ID, Query } from "appwrite";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser){
    try{
        const newAccount= await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
        if(!newAccount) throw Error;

        const avatarUrl= avatars.getInitials(user.name);

        // const imageUrl = new URL(avatarUrl);

        const newUser= await saveUserToDB({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            username: user.username,
            imageUrl: avatarUrl,           
        });

        return newUser;
    }catch(error){
        console.error();
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
    }) {

    try {
        const newUser= await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        )
        return newUser;

    } catch (error) {
        console.log(error);
        
    }
}

export async function signInAccount(user: {email: string; password: string;}){

    // try {
    //     // Check if a session already exists
    //     const currentSession = await account.get();
    //     if (currentSession) {
    //       console.log("User already logged in with an active session.");
    //       return currentSession;
    //     }
    //   } catch (error) {
    //     // If the session check fails (e.g., no session), continue with login
    //     console.log("No active session found, proceeding to create a new session.");
    //   }

    try {
        const session = await account.createEmailSession(user.email, user.password);

        return session;
    } catch (error) {
        console.log(error);
    }
}

export async function getCurrentUser(){
    try {
        const currentAccount= await account.get();

        if(!currentAccount) throw Error;

        const currentUser= await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]// fetching a query of type array
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount(){
    try {
        const session= await account.deleteSession("current");

        return session;
    } catch (error) {
        console.log(error);
    }
}

//uses 3 consecutively declared function below it
export async function createPost(post:INewPost) {
    try {
        //upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        if(!uploadedFile) throw Error;

        const fileUrl = getFilePreview(uploadedFile.$id);

        if(!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw Error;
        }

        //Convert Tags into an Array
        const tags= post.tags?.replace(/ /g,'').split(',') || [];

        //Save Post to Database
        const newPost= await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            //now passing an entire object as a parameter
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags // can be of same name
            }
        )
        if(!newPost){
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
        
    }
}

//below func is used in createPost func just above
export async function uploadFile(file:File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file,
            // [Permission.create(Role.any())]
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
        
    }
}

//below func is used in createPost func just above uploadFile func
export  function getFilePreview(fileId:string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000, // height
            2000, //width
            'top', // where it will show
            100, // quality
        )

        return fileUrl;
    } catch (error) {
        console.log(error);
        
    }
}

//used in createPost func when file gets corrupted during its creation.
export async function deleteFile(fileId:string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId,fileId);

        return {status: 'ok'}; // status object.
    } catch (error) {
        console.log(error);
        
    }
}

export async function getRecentPosts() {
    const posts= await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )

    if(!posts) throw Error;

    return posts;
}


export async function likePost(postId:string, likesArray: string[] ) {
    try {
        const updatePost = await  databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )

        if(!updatePost) throw Error;

        return updatePost;

    } catch (error) {
        console.log(error);
        
    }
}

export async function savePost(userId: string, postId: string) {
    try {
      const updatedPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savesCollectionId,
        ID.unique(),
        {
          user: userId,
          post: postId,
        }
      );
  
      if (!updatedPost) throw Error;
  
      return updatedPost;
    } catch (error) {
      console.log(error);
    }
  }

//  Deletes Saved Posts
export async function deleteSavedPost(savedRecordId: string) {
    try {
      const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savesCollectionId,
        savedRecordId
      );
  
      if (!statusCode) throw Error;
  
      return { status: "Ok" };
    } catch (error) {
      console.log(error);
    }
  }

// used for EditPost.tsx
export async function getPostById(postId?: string) {

    if (!postId) throw Error;

    try {
        const post =await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
        );

        return post;
    } catch (error) {
        console.log(error);
        
    }
}

//used in editing post for updation
export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate= post.file.length > 0;

    try {
        // image need to be reassignable, so let.
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }
        if(hasFileToUpdate){

            //upload image to storage
            const uploadedFile = await uploadFile(post.file[0]);
            if(!uploadedFile) throw Error;

            const fileUrl = getFilePreview(uploadedFile.$id);

            if(!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = {...image,imageUrl: fileUrl, imageId: uploadedFile.$id}
        }

        

        //Convert Tags into an Array
        const tags= post.tags?.replace(/ /g,'').split(',') || [];

        //Updates and make changes to Post in Database
        const updatedPost= await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            //now passing an entire object as a parameter
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags // can be of same name
            }
        )
        if(!updatedPost){
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
        
    }
}

export async function deletePost(postId?: string, imageId?: string) {
    if (!postId || !imageId) return;
  
    try {
      const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
      );
  
      if (!statusCode) throw Error;
  
      await deleteFile(imageId);
  
      return { status: "Ok" };
    } catch (error) {
      console.log(error);
    }
  }

export async function getInfinitePosts({ pageParam }: { pageParam?: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(3)];
  
    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }
  
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
}

export async function searchPosts(searchTerm: string){
    try {
        const posts =  await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if(!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
  
      if (!user) throw Error;
  
      return user;
    } catch (error) {
      console.log(error);
    }
  }

//used in useGetUsers for fetching infinite users
export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
}


// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
    if (!userId) return;
  
    try {
      const post = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
      );
  
      if (!post) throw Error;
  
      return post;
    } catch (error) {
      console.log(error);
    }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
      let image = {
        imageUrl: user.imageUrl,
        imageId: user.imageId,
      };
  
      if (hasFileToUpdate) {
        // Upload new file to appwrite storage
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw Error;
  
        // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }
  
        image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
      }
  
      //  Update user
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,
        {
          name: user.name,
          bio: user.bio,
          imageUrl: image.imageUrl,
          imageId: image.imageId,
        }
      );
  
      // Failed to update
      if (!updatedUser) {
        // Delete new file that has been recently uploaded
        if (hasFileToUpdate) {
          await deleteFile(image.imageId);
        }
        // If no new file uploaded, just throw error
        throw Error;
      }
  
      // Safely delete old file after successful update
      if (user.imageId && hasFileToUpdate) {
        await deleteFile(user.imageId);
      }
  
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
}
