import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useForm } from "react-hook-form"
import { SignupValidation } from "@/lib/validation"
import Loader from "@/components/shared/Loader"
import { Link, useNavigate } from "react-router-dom"
// import { createUserAccount } from "@/lib/appwrite/api"
import { useCreateUserAccount,useSignInAccount } from "@/lib/react-query/queriesAndMutations"
// import { signInAccount } from "@/lib/appwrite/api"
import { useUserContext } from "@/context/AuthContext"
// import React from 'react'


const SignupForm = () => {
  const { toast } = useToast()
  const {checkAuthUser, isLoading : isUserLoading } = useUserContext();

  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

    //Queries
    const { mutateAsync: createUserAccount, isPending: isCreatingAccount }= useCreateUserAccount();

    const { mutateAsync: signInAccount, isPending: isSigningInUser }= useSignInAccount();
    


 // Handler
 const handleSignup = async (user: z.infer<typeof SignupValidation>) => {  
  // Create User
    const newUSer= await createUserAccount(user);
    try{
      if(!newUSer){
        return toast({title: "Sign up failed in newUser, PLease try again"})
      }
      
      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });
      
      if(!session){
        return toast({title: "Sign up failed due to Session, PLease try again"})

        navigate('/sign-in');

        return;
      }

      const isLoggedIn = await checkAuthUser();

      if(isLoggedIn){
        form.reset();

        navigate('/');
      }else{
        toast({title: 'Sign-up failed: not Logged in, Please try again.',});

        return;
      }
    } catch(error){
        console.log({ error });
    }
  }

  return (
    
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg"/>

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">To use LinkClick, please enter your details</p>
      
        <form onSubmit={form.handleSubmit(handleSignup)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary">
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader/>Loading...
              </div>
            ): 'Sign up' }
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
           Already have an account?
            <Link to={"/sign-in"} className="text-primary-500 text-small-semibold ml-1">
            Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
 
  )
}

export default SignupForm;