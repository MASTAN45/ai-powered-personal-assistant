import { useState } from 'react';
import { Sparkles, FileText, MessageSquare, Copy, RefreshCw, Save, X } from 'lucide-react';

interface AIConversationCopilotProps {
  conversation: any;
  onDraftSaved?: (draft: string) => void;
}

export default function AIConversationCopilot({ conversation, onDraftSaved }: AIConversationCopilotProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'reply'>('summary');
  const [replyTone, setReplyTone] = useState<'professional' | 'friendly' | 'formal' | 'concise'>('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState('');

  // Generate deterministic summary from conversation
  const generateSummary = () => {
    const messages = conversation.messages || [];
        
    // Extract key information
    const sender = conversation.sender?.name || 'Unknown';
    const subject = conversation.subject;
    const messageCount = messages.length;
    
    // Analyze content for action items (simple keyword detection)
    const content = messages.map((m: any) => m.body?.text || '').join(' ').toLowerCase();
    const hasQuestion = content.includes('?');
    const hasDeadline = /deadline|due date|by \w+day/i.test(content);
    const hasRequest = /please|could you|would you|can you|need/i.test(content);

    return {
      purpose: subject,
      sender: sender,
      messageCount: messageCount,
      keyPoints: [
        `Conversation with ${sender} regarding "${subject}"`,
        `Contains ${messageCount} message${messageCount > 1 ? 's' : ''}`,
        hasQuestion ? 'Contains questions requiring answers' : 'No direct questions',
        hasRequest ? 'Contains specific requests' : 'Informational content',
      ],
      actionRequired: conversation.classification === 'CLIENT_TO_REPLY' ? 'Client action required' : 'Assistant to handle',
      hasDeadline: hasDeadline,
      suggestedNextStep: conversation.classification === 'CLIENT_TO_REPLY' 
        ? 'Review and respond to client'
        : 'Draft reply for client approval',
    };
  };

  const summary = generateSummary();

  // Generate reply draft based on tone
  const handleGenerateReply = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const sender = conversation.sender?.name || 'there';
            
      let reply = '';
      
      switch (replyTone) {
        case 'professional':
          reply = `Dear ${sender},\n\nThank you for your email regarding ${conversation.subject}.\n\nI have reviewed your message and would like to address your concerns. Based on the information provided, I recommend the following steps:\n\n1. [Action item 1]\n2. [Action item 2]\n\nPlease let me know if you have any questions or need further clarification.\n\nBest regards`;
          break;
        case 'friendly':
          reply = `Hi ${sender}!\n\nThanks for reaching out about ${conversation.subject}. I appreciate you bringing this to my attention.\n\nHere's what I'm thinking: [your response here]\n\nLet me know what you think!\n\nCheers`;
          break;
        case 'formal':
          reply = `Dear ${sender},\n\nI am writing in response to your correspondence dated ${new Date().toLocaleDateString()} concerning ${conversation.subject}.\n\nUpon careful consideration of the matter, I would like to propose the following course of action:\n\n[Detailed response]\n\nI remain at your disposal for any further discussion.\n\nYours sincerely`;
          break;
        case 'concise':
          reply = `Hi ${sender},\n\nRe: ${conversation.subject}\n\n[Brief response]\n\nThanks`;
          break;
      }
      
      setGeneratedReply(reply);
      setDraftContent(reply);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(generatedReply);
    // Toast notification would go here
  };

  const handleSaveDraft = () => {
    if (onDraftSaved) {
      onDraftSaved(draftContent);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Conversation Copilot</h3>
        </div>
        <p className="text-sm text-indigo-100 mt-1">
          Get intelligent insights and reply suggestions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'summary'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Summary
        </button>
        <button
          onClick={() => setActiveTab('reply')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'reply'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Reply Assistant
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'summary' ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Conversation Purpose
              </h4>
              <p className="text-sm text-gray-900 dark:text-white">{summary.purpose}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Key Points
              </h4>
              <ul className="space-y-1">
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Required Action
              </h4>
              <p className="text-sm text-gray-900 dark:text-white">{summary.actionRequired}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Suggested Next Step
              </h4>
              <p className="text-sm text-gray-900 dark:text-white">{summary.suggestedNextStep}</p>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                ℹ️ Summary generated using rule-based analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Reply Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['professional', 'friendly', 'formal', 'concise'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setReplyTone(tone as any)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      replyTone === tone
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            {!generatedReply && (
              <button
                onClick={handleGenerateReply}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Reply</span>
                  </>
                )}
              </button>
            )}

            {/* Generated Reply */}
            {generatedReply && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Generated Draft
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyReply}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={handleGenerateReply}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </button>
                  </div>
                </div>

                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => { setGeneratedReply(''); setDraftContent(''); }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  ℹ️ Draft generated using template-based system. Please review and customize before sending.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}