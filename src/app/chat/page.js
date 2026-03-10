"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";
import { backendFetch } from "../utils/backendClient";
import { isQuizCompleted } from "../utils/quizStatus";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

function resolveWsBase() {
  if (WS_BASE) return WS_BASE;
  if (typeof window !== "undefined") {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${wsProtocol}://${window.location.host}`;
  }
  return "";
}

export default function ChatPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const activeGroupRef = useRef(null);

  // Current user
  const [myRegNo, setMyRegNo] = useState(null);
  const [generalRoomId, setGeneralRoomId] = useState(null);

  // Chat data
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const handleSetActiveGroup = (group) => {
    activeGroupRef.current = group;
    setActiveGroup(group);
  };
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  //ADDITIONS FOR ALERT
  const [showGuidelines, setShowGuidelines] = useState(true);
  

  // WebSocket refs: one for general chat, one for DM
  const generalWsRef = useRef(null);
  const dmWsRef = useRef(null);

  const bottomRef = useRef(null);

  // ── Load current user ──
  useEffect(() => {
    setIsAnimating(true);
    const loadUser = async () => {
      try {
        const res = await backendFetch("student/getStudent");
        const student = res?.user || {};
        if (!isQuizCompleted(student)) {
          router.push("/personality-quiz");
          return;
        }
        setMyRegNo(student.regNo);
        setGeneralRoomId(student.hostelType || null);
      } catch { }
    };
    loadUser();
  }, []);

  // ADDITIONS FOR ALERT
  useEffect(() => {
  const agreed = localStorage.getItem("chat_guidelines_agreed");
  if (!agreed) {
    setShowGuidelines(true);
  }
}, []);

  // ── Build groups list: general chat room + DM contacts ──
  useEffect(() => {
    if (!myRegNo) return;
    const loadGroups = async () => {
      try {
        // DM contacts
        const contacts = await backendFetch(`dm/contacts/${myRegNo}`);
        const dmGroups = (contacts || []).map((c) => ({
          id: `dm_${c.regNo}`,
          name: c.name,
          type: "dm",
          regNo: c.regNo,
          role: c.role,
          unread: c.unread || 0,
        }));

        // General hostel chat as first item
        const generalGroup = {
          id: "general",
          name: "Hostel Chat",
          type: "hostel",
          members: null,
        };

        setGroups([generalGroup, ...dmGroups]);
      } catch { }
    };
    loadGroups();
  }, [myRegNo]);

  // ── Connect General Chat WebSocket ──
  useEffect(() => {
    if (!myRegNo) return;

    const wsBase = resolveWsBase();
    if (!wsBase) {
      console.error("[chat] Unable to resolve WebSocket base URL for general chat.");
      return;
    }

    const wsUrl = `${wsBase}/generalChat/ws/${myRegNo}`;
    console.info("[chat] Connecting general chat socket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    generalWsRef.current = ws;

    ws.onopen = () => {
      console.info("[chat] General chat socket connected.");
    };

    ws.onerror = (event) => {
      console.error("[chat] General chat socket error:", event);
    };

    ws.onclose = (event) => {
      console.warn("[chat] General chat socket closed:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "welcome") {
          setGeneralRoomId(data.room_id || null);
        } else if (data.type === "chat") {
          const msg = {
            id: data.id || Date.now() + Math.random(),
            sender: data.sender_name,
            senderId: data.sender_reg_no,
            text: data.message,
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => ({
            ...prev,
            general: [...(prev["general"] || []), msg],
          }));
        } else if (data.type === "system") {
          setMessages((prev) => ({
            ...prev,
            general: [...(prev["general"] || []), {
              id: Date.now() + Math.random(),
              text: data.message,
              isSystem: true,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }],
          }));
        } else if (data.type === "error") {
          console.error("[chat] General chat server error:", data.message || "Unknown error");
        }
      } catch { }
    };

    return () => ws.close();
  }, [myRegNo]);

  // ── Load hostel chat history ──
  useEffect(() => {
    if (!myRegNo || !generalRoomId) return;
    const loadGeneralHistory = async () => {
      try {
        const history = await backendFetch(`generalChat/history/${generalRoomId}`);
        const mapped = (history || []).map((msg) => ({
          id: msg.id || Date.now() + Math.random(),
          sender: msg.sender_name,
          senderId: msg.sender_reg_no,
          text: msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages((prev) => {
          const existingGeneral = prev.general || [];
          const historyIds = new Set(mapped.map((msg) => String(msg.id)));
          const liveOnly = existingGeneral.filter((msg) => !historyIds.has(String(msg.id)));
          return { ...prev, general: [...mapped, ...liveOnly] };
        });
      } catch { }
    };
    loadGeneralHistory();
  }, [myRegNo, generalRoomId]);

  // ── Connect DM WebSocket ──
  useEffect(() => {
    if (!myRegNo) return;

    const wsBase = resolveWsBase();
    if (!wsBase) {
      console.error("[chat] Unable to resolve WebSocket base URL for DM.");
      return;
    }

    const wsUrl = `${wsBase}/dm/ws/${myRegNo}`;
    console.info("[chat] Connecting DM socket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    dmWsRef.current = ws;

    ws.onopen = () => {
      console.info("[chat] DM socket connected.");
    };

    ws.onerror = (event) => {
      console.error("[chat] DM socket error:", event);
    };

    ws.onclose = (event) => {
      console.warn("[chat] DM socket closed:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          const contactRegNo = data.senderRegNo === myRegNo ? data.receiverRegNo : data.senderRegNo;
          const groupId = `dm_${contactRegNo}`;
          const msg = {
            id: data.id || Date.now(),
            sender: data.senderRegNo === myRegNo ? "You" : data.senderRegNo,
            senderId: data.senderRegNo === myRegNo ? "me" : data.senderRegNo,
            text: data.message,
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => ({
            ...prev,
            [groupId]: [...(prev[groupId] || []), msg],
          }));
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId && activeGroupRef.current?.id !== groupId
                ? { ...g, unread: (g.unread || 0) + 1 }
                : g
            )
          );
        }
      } catch { }
    };

    return () => ws.close();
  }, [myRegNo]);

  // ── Load DM history when a DM contact is selected ──
  useEffect(() => {
    if (!myRegNo || !activeGroup || activeGroup.type !== "dm") return;
    const loadHistory = async () => {
      try {
        const history = await backendFetch(`dm/history/${myRegNo}/${activeGroup.regNo}`);
        const mapped = (history || []).map((msg) => ({
          id: msg.id,
          sender: msg.senderRegNo === myRegNo ? "You" : msg.senderRegNo,
          senderId: msg.senderRegNo === myRegNo ? "me" : msg.senderRegNo,
          text: msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages((prev) => ({ ...prev, [activeGroup.id]: mapped }));
        setGroups((prev) =>
          prev.map((g) => g.id === activeGroup.id ? { ...g, unread: 0 } : g)
        );
      } catch { }
    };
    loadHistory();
  }, [myRegNo, activeGroup]);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGroup, messages]);

  // ── Send message ──
  const sendMessage = () => {
    if (!input.trim() || !activeGroup) return;

    if (activeGroup.type === "hostel") {
      if (generalWsRef.current?.readyState === WebSocket.OPEN) {
        generalWsRef.current.send(JSON.stringify({
          action: "chat",
          message: input.trim(),
        }));
      }
    } else if (activeGroup.type === "dm") {
      if (dmWsRef.current?.readyState === WebSocket.OPEN) {
        dmWsRef.current.send(JSON.stringify({
          targetRegNo: activeGroup.regNo,
          message: input.trim(),
        }));
      }
    }
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  // ADDITIONS FOR ALERT
  const acceptGuidelines = () => {
  localStorage.setItem("chat_guidelines_agreed", "true");
  setShowGuidelines(false);
};
  const currentMessages = activeGroup ? (messages[activeGroup.id] || []) : [];

  return (
    <BackgroundGrid>
      {/*ADDITIONS FOR ALERT*/ }
      {/* Chat Guidelines Popup */}
      {/* Chat Guidelines Popup */}
{showGuidelines && (
  <div className="fixed inset-0 flex items-center justify-center z-[999]">

    <div className="bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[5px] p-6 max-w-[500px] flex flex-col items-center gap-4">

      <p className="font-semibold text-center">
        Guidelines to use the chat feature
      </p>

      <ul className="text-sm text-center list-disc list-inside space-y-1">
        <li>Be respectful and maintain friendly conversation.</li>
        <li>Do not use abusive, offensive or discriminatory language.</li>
        <li>Avoid sharing personal or sensitive information.</li>
        <li>No spam, promotions, or repeated messages.</li>
      </ul>

      <button
        onClick={acceptGuidelines}
        className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-4 py-2 font-semibold hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px]"
      >
        I Agree
      </button>

    </div>

  </div>
)}

     {!showGuidelines && (
      <div className={`${syne.className} min-h-screen relative p-4 flex flex-col items-center justify-center pt-20 md:pt-20 pb-10 md:pb-2`}>

        {/* ── Top bar: Logo + Navbar ── */}
        <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-8 flex justify-between items-center z-50">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="focus:outline-none"
            aria-label="Go to homepage"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={160}
              height={60}
              className="w-auto h-12 md:h-16"
              priority
            />
          </button>
          <Navbar wrapperClass="static flex items-center h-8 md:h-12" />
        </div>

         
        {/* ── Main card ── */}
        <main className={`w-full max-w-[1045px] bg-[#9AD7FD] border border-black shadow-[5px_5px_0px_black]
         rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0 transition-all duration-300 ease-out
            ${isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}
              `}>

          {/* Header */}
          <div className="flex flex-row justify-between items-center mb-5 gap-3">
            <h1 className="text-xl md:text-2xl lg:text-[26px] font-bold leading-tight">
              Chat with your soon-to-be roommates!
            </h1>
            <button
              onClick={() => handleSetActiveGroup(null)}
              aria-label="Go back"
              className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] p-1.5 md:p-2 hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all self-start mt-1 md:mt-0 md:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Chat layout */}
          <div className="flex gap-4" style={{ height: "calc(100vh - 320px)", minHeight: 360 }}>

            {/* Sidebar */}
            <div className={`chat-scrollbar flex-shrink-0 bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[5px] p-4 overflow-y-auto
              ${activeGroup ? "hidden md:block" : "block"}
              w-full md:w-[220px] lg:w-[260px]`}>
              <h2 className="text-xl font-bold mb-4">Chats</h2>
              <div className="flex flex-col gap-3">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSetActiveGroup(g)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-[4px] border border-black transition-all
                      ${activeGroup?.id === g.id
                        ? "bg-[#c0392b] shadow-[1px_1px_0px_black] translate-x-[2px] translate-y-[2px]"
                        : "bg-[#FB5E4C] shadow-[3px_3px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black]"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{g.name}</div>
                      <div className="text-[11px] text-white/80 mt-0.5">
                        {g.type === "hostel" ? "Hostel Group" : g.role || "Direct Message"}
                      </div>
                    </div>
                    {g.unread > 0 && (
                      <span className="bg-white text-[#FB5E4C] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {g.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div className={`flex-1 flex flex-col bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[5px] overflow-hidden min-w-0
              ${!activeGroup ? "hidden md:flex" : "flex"}`}>

              {activeGroup ? (
                <>
                  {/* Chat header */}
                  <div className="bg-[#FB5E4C] border-b border-black px-4 py-3 flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleSetActiveGroup(null)}
                      className="md:hidden text-white text-xl font-bold pr-1"
                    >
                      ←
                    </button>
                    <span className="font-bold text-white text-base">{activeGroup.name}</span>
                  </div>

                  {/* Messages */}
                  <div className="chat-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {currentMessages.map((msg) => {
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="text-center text-xs text-gray-500 italic py-1">
                            {msg.text}
                          </div>
                        );
                      }
                      const isMe = msg.senderId === myRegNo || msg.senderId === "me";
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div style={{ maxWidth: "70%" }}>
                            {!isMe && (
                              <div className="text-xs font-bold text-[#7a1a1a] mb-1 pl-1">{msg.sender}</div>
                            )}
                            <div className={`px-3 py-2 rounded-[10px] border border-black shadow-[2px_2px_0px_black] text-sm flex flex-col gap-1 break-words
                              ${isMe ? "bg-[#FEE3D2] rounded-br-[3px]" : "bg-white rounded-bl-[3px]"}`}>
                              {msg.text}
                              <span className="text-[10px] text-gray-400 self-end">{msg.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="bg-[#FB5E4C] border-t border-black px-3 py-3 flex items-center gap-2 flex-shrink-0">
                    <input
                      className="flex-1 border border-black rounded-[24px] px-4 py-2 text-sm bg-white outline-none font-[inherit] min-w-0"
                      placeholder="Type your Message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-black text-white border border-black rounded-[6px] px-4 py-2 text-sm font-bold flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                  <span className="text-5xl"></span>
                  <span className="text-sm font-semibold">Select a chat to start messaging</span>
                </div>
              )}
            </div>
          </div>
        </main>
        <style jsx global>{`
          .chat-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #8e8e95 #f3b1b0;
            scrollbar-gutter: stable;
          }

          .chat-scrollbar::-webkit-scrollbar {
            width: 10px;
          }

          .chat-scrollbar::-webkit-scrollbar-track {
            background: #f3b1b0;
            border-left: 1px solid #000;
          }

          .chat-scrollbar::-webkit-scrollbar-thumb {
            background: #8e8e95;
            border-radius: 999px;
            border: 2px solid #f3b1b0;
          }

          .chat-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #74747b;
          }
        `}</style>
      </div>
    
            )}

            </BackgroundGrid>
  );
}
