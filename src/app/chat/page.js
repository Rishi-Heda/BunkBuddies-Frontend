"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Syne } from "next/font/google";
import BackgroundGrid from "../components/BackgroundLines";
import Navbar from "../components/Navbar";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// ── Mock data — replace with real API/WebSocket data when backend is ready ──
const MOCK_GROUPS = [
  { id: "room 1", name: "Room 1", type: "room", members: 4 },
  { id: "room 2",   name: "Room 2",   type: "room", members: 3 },
  { id: "room 3",         name: "Room 3",    type: "hostel", members: 120 },
];

const MOCK_MESSAGES = {
  "room 1": [
    { id: 1, sender: "Akshit", senderId: "u1", text: "Hello. Welcome to the room!", time: "9:00 AM" },
    { id: 2, sender: "Akshit", senderId: "u1", text: "I am Akshit.",                time: "9:01 AM" },
    { id: 3, sender: "You",    senderId: "me", text: "Hey There!",                  time: "9:05 AM" },
  ],
  "room 2": [
    { id: 1, sender: "Riya", senderId: "u2", text: "Anyone from Mumbai?", time: "8:30 AM" },
    { id: 2, sender: "You",  senderId: "me", text: "Yes! me",             time: "8:32 AM" },
  ],
  "room 3": [
    { id: 1, sender: "Warden", senderId: "u3", text: "Mess timings updated: 7-9 AM", time: "7:00 AM" },
  ],
};

export default function ChatPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [groups]      = useState(MOCK_GROUPS);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages]       = useState(MOCK_MESSAGES);
  const [input, setInput]             = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGroup, messages]);

  const sendMessage = () => {
    if (!input.trim() || !activeGroup) return;
    const newMsg = {
      id: Date.now(),
      sender: "You",
      senderId: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [activeGroup.id]: [...(prev[activeGroup.id] || []), newMsg],
    }));
    setInput("");
    // TODO: socket.emit("send_message", { groupId: activeGroup.id, text: input })
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentMessages = activeGroup ? (messages[activeGroup.id] || []) : [];

  return (
    <BackgroundGrid>
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
        <main className={`w-full max-w-[1045px] bg-[#9AD7FD] border border-black shadow-[5px_5px_0px_black] rounded-[5px] px-5 py-6 md:px-7 md:py-8 relative mt-4 md:mt-0 transition-all duration-300 ease-out ${
          isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        }`}>

          {/* Header */}
          <div className="flex flex-row justify-between items-center mb-5 gap-3">
            <h1 className="text-xl md:text-2xl lg:text-[26px] font-bold leading-tight">
              Chat with your soon-to-be roomates!
            </h1>
            <button
              onClick={() => setActiveGroup(null)}
              className="bg-[#FB5E4C] border border-black shadow-[2.5px_2.5px_0px_black] rounded-[4px] px-3 md:px-5 py-1 md:py-1.5 text-[15px] md:text-[18px] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[2.5px] active:translate-y-[2.5px] transition-all whitespace-nowrap self-start mt-1 md:mt-0 md:self-auto"
            >
              ← Go Back
            </button>
          </div>

          {/* Chat layout */}
          <div className="flex gap-4" style={{ height: "calc(100vh - 280px)", minHeight: 360 }}>

            {/* Sidebar */}
            <div className={`flex-shrink-0 bg-[#FFB7B6] border border-black shadow-[3px_3px_0px_black] rounded-[5px] p-4 overflow-y-auto
              ${activeGroup ? "hidden md:block" : "block"}
              w-full md:w-[220px] lg:w-[260px]`}>
              <h2 className="text-xl font-bold mb-4">Chats</h2>
              <div className="flex flex-col gap-3">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-[4px] border border-black transition-all
                      ${activeGroup?.id === g.id
                        ? "bg-[#c0392b] shadow-[1px_1px_0px_black] translate-x-[2px] translate-y-[2px]"
                        : "bg-[#FB5E4C] shadow-[3px_3px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black]"
                      }`}
                  >
                    <span className="text-xl">{g.type === "hostel" ? "" : ""}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{g.name}</div>
                      <div className="text-[11px] text-white/80 mt-0.5">
                        {g.type === "hostel" ? "Hostel Group" : "Room Group"} · {g.members} members
                      </div>
                    </div>
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
                    {/* Back to list — mobile only */}
                    <button
                      onClick={() => setActiveGroup(null)}
                      className="md:hidden text-white text-xl font-bold pr-1"
                    >
                      ←
                    </button>
                    <span className="text-xl"></span>
                    <span className="font-bold text-white text-base">{activeGroup.name}</span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {currentMessages.map((msg) => {
                      const isMe = msg.senderId === "me";
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
                // Desktop empty state
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                  <span className="text-5xl"></span>
                  <span className="text-sm font-semibold">Select a chat to start messaging</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </BackgroundGrid>
  );
}
