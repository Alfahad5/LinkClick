import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useForm } from "react-hook-form"
import { SigninValidation } from "@/lib/validation"
import Loader from "@/components/shared/Loader"
import { Link, useNavigate } from "react-router-dom"
// import { createUserAccount } from "@/lib/appwrite/api"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
// import { signInAccount } from "@/lib/appwrite/api"
import { useUserContext } from "@/context/AuthContext"
// import React from 'react'


const SigninForm = () => {
  const { toast } = useToast();
  const navigate= useNavigate();
  const {checkAuthUser, isLoading : isUserLoading } = useUserContext();

  //Queries
  const { mutateAsync: signInAccount,isPending: isLoading }= useSignInAccount();
  
  // 1. Define your form.
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email:"",
      password:"",
    },
  });

  // 2. Define a submit handler.

  const handleSignin = async (user: z.infer<typeof SigninValidation>) =>
    {
    
      const session = await signInAccount(user);
    
    if(!session){
      return toast({title: "Log in failed due to !Session, Please try again"});
    }

    const isLoggedIn = await checkAuthUser();

    if(isLoggedIn){
      form.reset();

      navigate('/');
    }else{
      toast({title: 'Login failed in !Logged in. Please try again.',});

    }
  };

  return (
    
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg"/>

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
        Log in to your account</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
        Welcome back! Please enter your details</p>
      
        <form onSubmit={form.handleSubmit(handleSignin)} className="flex flex-col gap-5 w-full mt-4">

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
                <FormLabel>Pasword</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isLoading || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader/> Loading...
              </div>
            ) : (
              'Log in'
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account?
            <Link to={"/sign-up"}
             className="text-primary-500 text-small-semibold ml-1">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;