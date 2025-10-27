import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Upload,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";
import { auth, db, storage } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

interface Skill {
  name: string;
  level: number;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Experience {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface TestScore {
  category: string;
  difficulty: string;
  score: number;
  date: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  testScores: TestScore[];
  appliedJobsCount?: number;
  socialLinks: {
    github: string;
    linkedin: string;
    website: string;
  };
}

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    skills: [],
    education: [],
    experience: [],
    testScores: [],
    socialLinks: { github: "", linkedin: "", website: "" },
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [uploading, setUploading] = useState(false);

  // ✅ Load user data when authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            name: userData.name || "",
            email: currentUser.email || "",
            phone: userData.phone || "",
            location: userData.location || "",
            bio: userData.bio || "",
            avatar: userData.avatar || "",
            skills: userData.skills || [],
            education: userData.education || [],
            experience: userData.experience || [],
            testScores: [],
            appliedJobsCount: 0,
            socialLinks:
              userData.socialLinks || { github: "", linkedin: "", website: "" },
          });
        } else {
          const defaultUserData = {
            name: "",
            email: currentUser.email,
            phone: "",
            location: "",
            bio: "",
            avatar: "",
            skills: [],
            education: [],
            experience: [],
            socialLinks: { github: "", linkedin: "", website: "" },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setDoc(userRef, defaultUserData);
          setProfileData(defaultUserData);
        }

        // Fetch test results
        const testResultsRef = collection(db, "testResults");
        const q1 = query(
          testResultsRef,
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc")
        );
        const tests = await getDocs(q1);
        const testScores: TestScore[] = tests.docs.map((docSnap) => {
          const data = docSnap.data();
          const date =
            data.date?.toDate?.() instanceof Date
              ? data.date.toDate().toISOString().split("T")[0]
              : "";
          return {
            category: data.category || "N/A",
            difficulty: data.difficulty || "N/A",
            score: data.score || 0,
            date,
          };
        });

        // Fetch applied jobs count
        const appsRef = collection(db, "applications");
        const q2 = query(appsRef, where("userEmail", "==", currentUser.email));
        const apps = await getDocs(q2);

        setProfileData((prev) => ({
          ...prev,
          testScores,
          appliedJobsCount: apps.size,
        }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setEditData(profileData);
  }, [profileData]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleSave = async () => {
    try {
      if (!auth.currentUser) return;
      setLoading(true);

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        ...editData,
        updatedAt: new Date(),
      });

      setProfileData(editData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    try {
      setUploading(true);
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        avatar: downloadURL,
        updatedAt: new Date(),
      });

      setProfileData((prev) => ({ ...prev, avatar: downloadURL }));
      setEditData((prev) => ({ ...prev, avatar: downloadURL }));
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative">
                {editData.avatar ? (
                  <img
                    src={editData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-gray-100 text-gray-400 text-3xl font-bold">
                    {editData.name ? editData.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-50">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                {uploading && (
                  <p className="text-sm text-white mt-2 text-center animate-pulse">
                    Uploading...
                  </p>
                )}
              </div>

              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="text-3xl font-bold text-white bg-transparent border-b border-white focus:outline-none"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white">
                    {profileData.name || "Your Name"}
                  </h1>
                )}

                <div className="flex flex-col md:flex-row mt-2 text-white opacity-90">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        className="bg-transparent border-b border-white focus:outline-none"
                        placeholder="Enter email"
                      />
                    ) : (
                      <span>{profileData.email || "No email"}</span>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="absolute top-4 right-4 bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50"
                >
                  <Edit className="w-5 h-5" />
                </button>
              ) : (
                <div className="absolute top-4 right-4 flex">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 mr-2"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bio + Contact Section */}
          <div className="p-6 space-y-6">
            {/* Bio */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-500" />
                About Me
              </h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell something about yourself..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-600">
                  {profileData.bio || "No bio yet."}
                </p>
              )}
            </section>

            {/* Contact Info */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <Phone className="w-6 h-6 mr-2 text-blue-500" />
                Contact Info
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500">Phone:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p>{profileData.phone || "N/A"}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-500">Location:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={editData.location}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter location"
                    />
                  ) : (
                    <p>{profileData.location || "N/A"}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-500" />
                Social Links
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {["github", "linkedin", "website"].map((key) => (
                  <div key={key}>
                    <label className="capitalize text-gray-500">
                      {key}:
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name={`socialLinks.${key}`}
                        value={editData.socialLinks[key as keyof typeof editData.socialLinks]}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              [key]: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder={`Enter ${key} URL`}
                      />
                    ) : (
                      <p>{profileData.socialLinks[key as keyof typeof profileData.socialLinks] || "N/A"}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
