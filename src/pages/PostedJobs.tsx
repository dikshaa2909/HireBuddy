import React, { useEffect, useState } from "react";
import { Edit, Trash, Eye, Loader } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    description: string;
    keySkills: string[];
    requirements: string[];
    benefits: string[];
    postedAt: Timestamp;
    deadline: Timestamp;
    hrEmail: string;
    additionalInfo?: string;
}

const PostedJobs: React.FC = () => {
    const { theme } = useTheme();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user?.email) {
                setUserEmail(user.email);
                fetchJobs(user.email);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchJobs = async (email: string) => {
        try {
            const jobsRef = collection(db, "jobs");
            const q = query(jobsRef, where("hrEmail", "==", email));
            const querySnapshot = await getDocs(q);
            
            const jobsData: Job[] = [];
            querySnapshot.forEach((doc) => {
                jobsData.push({ id: doc.id, ...doc.data() } as Job);
            });
            
            setJobs(jobsData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Failed to load jobs");
            setLoading(false);
        }
    };

    const handleView = (job: Job) => {
        setSelectedJob(job);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setSelectedJob(null);
        setOpenDialog(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await deleteDoc(doc(db, "jobs", id));
                setJobs(jobs.filter((job) => job.id !== id));
                toast.success("Job deleted successfully");
            } catch (error) {
                console.error("Error deleting job:", error);
                toast.error("Failed to delete job");
            }
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
                }}
            >
                <Loader className="animate-spin" style={{ color: theme === "dark" ? "#ffffff" : "#000000" }} />
            </div>
        );
    }
    
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div
            style={{
                padding: "24px",
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
            }}
        >
            <h1
                style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "24px",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                }}
            >
                Jobs Management
            </h1>

            {jobs.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        color: theme === "dark" ? "#cccccc" : "#666666",
                    }}
                >
                    <p>No jobs posted yet.</p>
                    <button
                        onClick={() => navigate('/job-builder')}
                        style={{
                            marginTop: "16px",
                            padding: "8px 16px",
                            backgroundColor: "#3b82f6",
                            color: "#ffffff",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Create a Job
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            style={{
                                padding: "16px",
                                backgroundColor: theme === "dark" ? "#2d2d2d" : "#f9fafb",
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                }}
                            >
                                {job.title}
                            </h2>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: theme === "dark" ? "#cccccc" : "#666666",
                                    marginBottom: "8px",
                                }}
                            >
                                {job.company} - {job.location}
                            </p>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                    marginBottom: "16px",
                                }}
                            >
                                {job.salary}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                }}
                            >
                                <button
                                    onClick={() => handleView(job)}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "8px",
                                        backgroundColor: "#3b82f6",
                                        color: "#ffffff",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Eye size={16} style={{ marginRight: "8px" }} />
                                    View
                                </button>
                                <button
                                    onClick={() => navigate(`/job-builder/${job.id}`)}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "8px",
                                        backgroundColor: "#f59e0b",
                                        color: "#ffffff",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Edit size={16} style={{ marginRight: "8px" }} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(job.id)}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "8px",
                                        backgroundColor: "#ef4444",
                                        color: "#ffffff",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Trash size={16} style={{ marginRight: "8px" }} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Job Details Dialog */}
            {openDialog && selectedJob && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: theme === "dark" ? "#2d2d2d" : "#ffffff",
                            borderRadius: "8px",
                            padding: "24px",
                            width: "90%",
                            maxWidth: "600px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                marginBottom: "16px",
                                color: theme === "dark" ? "#ffffff" : "#000000",
                            }}
                        >
                            {selectedJob.title}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Company:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>{selectedJob.company}</span>
                            </p>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Location:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>{selectedJob.location}</span>
                            </p>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Salary:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>
                                    {selectedJob.pay.currency} {selectedJob.pay.min} - {selectedJob.pay.max}
                                </span>
                            </p>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Job Type:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>{selectedJob.jobType.join(", ")}</span>
                            </p>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Shift:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>{selectedJob.shift}</span>
                            </p>
                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Description:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>{selectedJob.description}</span>
                            </p>

                            {selectedJob.keySkills && selectedJob.keySkills.length > 0 && (
                                <div>
                                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Key Skills:</strong>
                                    <ul style={{ color: theme === "dark" ? "#cccccc" : "#666666", marginLeft: "20px" }}>
                                        {selectedJob.keySkills.map((skill, index) => (
                                            <li key={index}>{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                <div>
                                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Requirements:</strong>
                                    <ul style={{ color: theme === "dark" ? "#cccccc" : "#666666", marginLeft: "20px" }}>
                                        {selectedJob.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.additionalInfo && (
                                <div>
                                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Additional Info:</strong>
                                    <p style={{ color: theme === "dark" ? "#cccccc" : "#666666", marginLeft: "8px" }}>
                                        Education: {selectedJob.additionalInfo.education}<br />
                                        Experience: {selectedJob.additionalInfo.experience}
                                    </p>
                                </div>
                            )}

                            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                <div>
                                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Benefits:</strong>
                                    <ul style={{ color: theme === "dark" ? "#cccccc" : "#666666", marginLeft: "20px" }}>
                                        {selectedJob.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p>
                                <strong style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>Posted At:</strong>{" "}
                                <span style={{ color: theme === "dark" ? "#cccccc" : "#666666" }}>
                                    {new Date(selectedJob.postedAt).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            style={{
                                marginTop: "16px",
                                padding: "8px 16px",
                                backgroundColor: "#3b82f6",
                                color: "#ffffff",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostedJobs;