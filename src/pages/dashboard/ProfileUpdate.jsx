import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../config";
import { useEffect, useState } from "react";

export default function ProfileUpdate() {
  // State for profile fields
  const [userId, setUserId] = useState("");
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    username: "",
    about: "",
    avatar_url: "",
    resume_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null); // For image file upload
  const [resumeFile, setResumeFile] = useState(null); // For resume PDF upload // Fetch user profile on component mount // Fetch user profile or create if it doesn't exist

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (user) {
        setUserId(user.id);
        setProfileData((prevState) => ({
          ...prevState,
          email: user.email, // Set initial email from authenticated user
        })); // Check if profile exists in 'profiles' table

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(); // Fetch a single record

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, insert a new one
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                first_name: "",
                last_name: "",
                country: "",
                street_address: "",
                city: "",
                state: "",
                zip_code: "",
                username: "",
                about: "",
                avatar_url: "",
                resume_url: "",
              },
            ]);

          if (insertError) {
            console.error("Error inserting new profile:", insertError);
          } else {
            console.log("Profile created for new user");
          }
        } else if (profile) {
          // Profile exists, update the state
          setProfileData(profile);
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  }; // Handle file changes for avatar and resume

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  }; // Function to upload file to Supabase storage

  const uploadFileToStorage = async (file, bucketName) => {
    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`${userId}/${file.name}`, file); // Store the file in a folder specific to the userfilename/file

      if (error) {
        console.error("Error uploading file:", error);
        return null;
      } // Get public URL of the uploaded file

      const publicUrl = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path).data.publicUrl;

      return publicUrl; // Return the public URL for the file
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Upload avatar if selected

    let avatarUrl = profileData.avatar_url;
    if (avatarFile) {
      avatarUrl = await uploadFileToStorage(avatarFile, "hrms"); // Use the hrms bucket
    } // Upload resume if selected

    let resumeUrl = profileData.resume_url;
    if (resumeFile) {
      resumeUrl = await uploadFileToStorage(resumeFile, "hrms"); // Use the hrms bucket
    } // Update profile in the database

    console.log(avatarUrl, resumeUrl);

    const { error } = await supabase
      .from("profiles") // Your table name
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        country: profileData.country,
        street_address: profileData.street_address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        username: profileData.username,
        about: profileData.about,
        avatar_url: avatarUrl,
        resume_url: resumeUrl,
      })
      .eq("id", userId); // Ensure you're updating the right user

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      console.log("Profile updated successfully");
    }
  };

  useEffect(() => {
    console.log(profileData);
  }, [profileData]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12 sm:space-y-16">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Profile
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Username
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                    workcation.com/
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    id="username"
                    autoComplete="username"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="janesmith"
                  />
                </div>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="about"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                About
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="about"
                  name="about"
                  rows={3}
                  value={profileData.about}
                  onChange={handleChange}
                  className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  defaultValue={""}
                />
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write a few sentences about yourself.
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6">
              <label
                htmlFor="photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Photo
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <div className="flex items-center gap-x-3">
                  {profileData.avatar_url && (
                    <img
                      src={profileData.avatar_url}
                      alt="avatar"
                      className="h-10 w-10 rounded-full mt-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  {/* <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Change
                  </button> */}
                </div>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Resume
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <div className="flex max-w-2xl justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          accept=".pdf"
                          type="file"
                          onChange={handleResumeChange}
                          className="sr-only"
                        />
                      </label>

                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      {resumeFile
                        ? resumeFile.name
                        : "PNG, JPG, GIF up to 10MB"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            Use a permanent address where you can receive mail.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                First name
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleChange}
                  id="first-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Last name
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleChange}
                  id="last-name"
                  autoComplete="family-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Email address
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Country
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="street-address"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Street address
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="street_address"
                  id="street_address"
                  value={profileData.street_address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xl sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="city"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                City
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={profileData.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="region"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                State / Province
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={profileData.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="zip_code"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                ZIP / Postal code
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="zip_code"
                  id="zip_code"
                  value={profileData.zip_code}
                  onChange={handleChange}
                  autoComplete="postal-code"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Notifications
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            We'll always let you know about important changes, but you pick what
            else you want to hear about.
          </p>

          <div className="mt-10 space-y-10 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <fieldset>
              <legend className="sr-only">By Email</legend>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:py-6">
                <div
                  className="text-sm font-semibold leading-6 text-gray-900"
                  aria-hidden="true"
                >
                  By Email
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  <div className="max-w-lg space-y-6">
                    <div className="relative flex gap-x-3">
                      <div className="flex h-6 items-center">
                        <input
                          id="comments"
                          name="comments"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <label
                          htmlFor="comments"
                          className="font-medium text-gray-900"
                        >
                          Comments
                        </label>
                        <p className="mt-1 text-gray-600">
                          Get notified when someones posts a comment on a
                          posting.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex gap-x-3">
                      <div className="flex h-6 items-center">
                        <input
                          id="candidates"
                          name="candidates"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <label
                          htmlFor="candidates"
                          className="font-medium text-gray-900"
                        >
                          Candidates
                        </label>
                        <p className="mt-1 text-gray-600">
                          Get notified when a candidate applies for a job.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex gap-x-3">
                      <div className="flex h-6 items-center">
                        <input
                          id="offers"
                          name="offers"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="text-sm leading-6">
                        <label
                          htmlFor="offers"
                          className="font-medium text-gray-900"
                        >
                          Offers
                        </label>
                        <p className="mt-1 text-gray-600">
                          Get notified when a candidate accepts or rejects an
                          offer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="sr-only">Push Notifications</legend>
              <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4 sm:py-6">
                <div
                  className="text-sm font-semibold leading-6 text-gray-900"
                  aria-hidden="true"
                >
                  Push Notifications
                </div>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="max-w-lg">
                    <p className="text-sm leading-6 text-gray-600">
                      These are delivered via SMS to your mobile phone.
                    </p>
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-everything"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-everything"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Everything
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-email"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-email"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Same as email
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="push-nothing"
                          name="push-notifications"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="push-nothing"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          No push notifications
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
