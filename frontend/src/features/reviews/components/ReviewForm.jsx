import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StarRating from './StarRating';
import { useCreateReview, useUpdateReview } from '../hooks/useReviews';
import { useCurrency } from '../../../context/CurrencyContext';
import { uploadReviewMedia } from '../services/reviewsService';
import { analyzeReviewTextToxicity, detectImmediateToxicWord } from '../services/toxicityClient';

const C = {
  bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
  goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
  text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF   = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY    = "'Jost','Inter',sans-serif";

const newReviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters')
    .max(1000).trim().optional().or(z.literal('')),
});

const sentimentMap = {
  0: '', 1: 'Poor — Very disappointed', 2: 'Fair — Below expectations',
  3: 'Good — Met expectations', 4: 'Very Good — Exceeded expectations',
  5: 'Excellent — Outstanding experience',
};
const sentimentColor = (r) => {
  if (r <= 2) return 'rgba(185,28,28,0.6)';
  if (r === 3) return '#d97706';
  return C.green;
};

const labelStyle = {
  fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em', color: C.faint,
  marginBottom: 8, display: 'block',
};

const tips = [
  'Describe if the gem matched the listing photos',
  'Comment on seller communication',
  'Mention packaging and delivery experience',
  'Note if gem matched the certification provided',
];

const ReviewForm = ({
  transactionId,
  existingReview = null,
  gemTitle = '',
  sellerName = '',
  transactionDate = '',
  transactionAmount = 0,
  gemThumbnail = null,
  onSuccess,
}) => {
  const isEdit = !!existingReview;
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const mutation = isEdit ? updateMutation : createMutation;

  const { formatPrice } = useCurrency();
  const [commentFocused, setCommentFocused] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [existingMediaUrls, setExistingMediaUrls] = useState(existingReview?.media_urls || []);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [isAnalyzingToxicity, setIsAnalyzingToxicity] = useState(false);
  const [isToxicDetected, setIsToxicDetected] = useState(false);
  const [toxicityWarning, setToxicityWarning] = useState('');
  const toxicityCheckVersionRef = useRef(0);

  const usedEdits = Number(existingReview?.edit_count || 0);
  const maxEdits = 3;
  const canStillEdit = !existingReview || usedEdits < maxEdits;
  const editsRemaining = maxEdits - usedEdits;

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(newReviewSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: existingReview
      ? { rating: existingReview.rating, comment: existingReview.comment || '' }
      : { rating: 0, comment: '' },
  });

  const ratingValue = watch('rating');
  const commentValue = watch('comment') || '';

  useEffect(() => {
    const content = String(commentValue || '').trim();
    const currentVersion = toxicityCheckVersionRef.current + 1;
    toxicityCheckVersionRef.current = currentVersion;

    if (!content) {
      setIsAnalyzingToxicity(false);
      setIsToxicDetected(false);
      setToxicityWarning('');
      return undefined;
    }

    const immediateMatch = detectImmediateToxicWord(content);
    if (immediateMatch) {
      setIsAnalyzingToxicity(false);
      setIsToxicDetected(true);
      setToxicityWarning('Please keep your language professional.');
      return undefined;
    }

    // Clear previous toxicity result immediately when text changes, then show re-check state.
    setIsToxicDetected(false);
    setToxicityWarning('');
    setIsAnalyzingToxicity(true);

    // Debounce inference so we avoid running the model on every keystroke.
    const timer = setTimeout(async () => {
      try {
        const analysis = await analyzeReviewTextToxicity(content);

        // Ignore stale async results when user keeps typing.
        if (toxicityCheckVersionRef.current !== currentVersion) {
          return;
        }

        setIsToxicDetected(analysis.flagged);
        setToxicityWarning(
          analysis.flagged
            ? 'Please keep your language professional.'
            : ''
        );
      } catch {
        if (toxicityCheckVersionRef.current !== currentVersion) {
          return;
        }
        // Fail open on client: backend middleware is the final enforcement layer.
        setIsToxicDetected(false);
        setToxicityWarning('');
      } finally {
        if (toxicityCheckVersionRef.current === currentVersion) {
          setIsAnalyzingToxicity(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [commentValue]);

  if (isEdit && !canStillEdit) {
    return (
      <div style={{
        background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
        borderRadius: 10, padding: '16px 20px',
      }}>
        <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: '#d97706' }}>
          This review can no longer be edited — you have reached the maximum of 3 edits.
        </span>
      </div>
    );
  }

  const handlePickMedia = (event) => {
    const picked = Array.from(event.target.files || []);
    if (picked.length === 0) return;

    const maxItems = 6;
    const left = maxItems - existingMediaUrls.length - newMediaFiles.length;
    if (left <= 0) {
      setMediaError('You can attach up to 6 media files.');
      event.target.value = '';
      return;
    }

    const accepted = [];
    for (const file of picked.slice(0, left)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;

      const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > sizeLimit) continue;

      accepted.push(file);
    }

    if (accepted.length === 0) {
      setMediaError('Only images (<=10MB) or videos (<=50MB) are allowed.');
      event.target.value = '';
      return;
    }

    setMediaError('');
    setNewMediaFiles((prev) => [...prev, ...accepted]);
    event.target.value = '';
  };

  const removeExistingMedia = (url) => {
    setExistingMediaUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewMedia = (index) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (isToxicDetected) {
      setToxicityWarning('Please keep your language professional.');
      return;
    }

    try {
      setMediaError('');
      setUploadingMedia(true);

      const uploadedUrls = [];
      for (const file of newMediaFiles) {
        const url = await uploadReviewMedia(file);
        uploadedUrls.push(url);
      }

      const allMedia = [...existingMediaUrls, ...uploadedUrls].slice(0, 6);

      const payload = isEdit
        ? {
            id: existingReview.id,
            rating: data.rating,
            comment: data.comment || undefined,
            media_urls: allMedia,
          }
        : {
            transaction_id: transactionId,
            rating: data.rating,
            comment: data.comment || undefined,
            media_urls: allMedia,
          };

      mutation.mutate(payload, {
        onSuccess: () => onSuccess?.(),
        onSettled: () => setUploadingMedia(false),
      });
    } catch (err) {
      setUploadingMedia(false);
      setMediaError(err?.message || 'Failed to upload media.');
    }
  };

  const allMediaPreview = [
    ...existingMediaUrls.map((url) => ({ type: 'existing', url })),
    ...newMediaFiles.map((file, index) => ({
      type: 'new',
      index,
      url: URL.createObjectURL(file),
      mime: file.type,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Gem preview card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: C.bg, borderRadius: 12, border: `0.5px solid ${C.border}`,
        padding: '12px 16px', width: '100%', boxSizing: 'border-box',
      }}>
        {gemThumbnail ? (
          <img src={gemThumbnail} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1A1A2E', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: '0.95rem', fontWeight: 600, color: C.text }}>
            {gemTitle || 'Gem Purchase'}
          </div>
          {sellerName && (
            <div style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted }}>
              Reviewing purchase from {sellerName}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {transactionAmount > 0 && (
            <div style={{ fontFamily: SERIF, fontSize: '1rem', fontWeight: 700, color: C.sapphire }}>
              {formatPrice(transactionAmount)}
            </div>
          )}
          {transactionDate && (
            <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.faint }}>
              {new Date(transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {isEdit && canStillEdit && (
        <div style={{
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
          borderRadius: 10, padding: '12px 16px',
        }}>
          <span style={{ fontFamily: BODY, fontSize: '0.82rem', color: '#d97706' }}>
            You can edit this review up to 3 times. {editsRemaining} edit(s) remaining.
          </span>
        </div>
      )}

      {/* Rating section */}
      <div>
        <label style={labelStyle}>Your Rating</label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating
              value={field.value}
              onChange={field.onChange}
              size="lg"
              precision="full"
            />
          )}
        />
        {ratingValue > 0 && (
          <div style={{
            fontFamily: SERIF, fontSize: '0.8rem', fontStyle: 'italic',
            color: sentimentColor(ratingValue), marginTop: 6,
          }}>
            {sentimentMap[ratingValue]}
          </div>
        )}
        {errors.rating && (
          <div style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red, marginTop: 4 }}>
            {errors.rating.message}
          </div>
        )}
      </div>

      {/* Comment section */}
      <div>
        <label style={labelStyle}>Your Review</label>
        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted, marginBottom: 8 }}>
          Optional but helpful for other buyers
        </div>
        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              onFocus={() => setCommentFocused(true)}
              onBlur={(e) => { setCommentFocused(false); field.onBlur(e); }}
              placeholder="Describe your experience with this seller. Was the gem as described? How was communication and delivery?"
              style={{
                minHeight: 120, width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 10,
                border: '1px solid', borderColor: commentFocused ? C.sapphire : C.border,
                background: C.bg, fontFamily: SERIF, fontSize: '0.95rem',
                color: C.text, resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          )}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            {isToxicDetected && toxicityWarning && (
              <div style={{
                marginBottom: 6,
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid rgba(185,28,28,0.45)',
                background: 'rgba(185,28,28,0.08)',
                color: C.red,
                fontFamily: BODY,
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {toxicityWarning}
              </div>
            )}
            {errors.comment && (
              <span style={{ fontFamily: BODY, fontSize: '0.75rem', color: C.red }}>
                {errors.comment.message}
              </span>
            )}
            {!isToxicDetected && isAnalyzingToxicity && commentValue.trim().length > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: BODY,
                fontSize: '0.75rem',
                color: C.muted,
              }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: `2px solid ${C.border}`,
                    borderTopColor: C.sapphire,
                    animation: 'toxicitySpin 0.8s linear infinite',
                    boxSizing: 'border-box',
                  }}
                />
                Checking language...
              </span>
            )}
          </div>
          <span style={{
            fontFamily: BODY, fontSize: '0.72rem',
            color: commentValue.length > 900 ? C.red : C.faint,
          }}>
            {commentValue.length} / 1000
          </span>
        </div>
      </div>

      {/* Media upload section */}
      <div>
        <label style={labelStyle}>Photos / Videos</label>
        <div style={{ fontFamily: BODY, fontSize: '0.72rem', color: C.muted, marginBottom: 8 }}>
          Add up to 6 files. Images up to 10MB, videos up to 50MB.
        </div>
        <label
          htmlFor="review-media"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.sapphire,
            fontFamily: BODY,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Add Media
        </label>
        <input
          id="review-media"
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handlePickMedia}
          style={{ display: 'none' }}
        />

        {allMediaPreview.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 12 }}>
            {allMediaPreview.map((media, i) => {
              const isVideo = (media.mime ? media.mime.startsWith('video/') : /\.(mp4|webm|mov)$/i.test(media.url));
              return (
                <div key={`${media.type}-${i}`} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, background: C.bg }}>
                  {isVideo ? (
                    <video src={media.url} controls style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <img src={media.url} alt="Review media" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  )}
                  <button
                    type="button"
                    onClick={() => media.type === 'existing' ? removeExistingMedia(media.url) : removeNewMedia(media.index)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 22, height: 22, borderRadius: 11,
                      border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff',
                      fontSize: '0.74rem', cursor: 'pointer',
                    }}
                    aria-label="Remove media"
                    title="Remove media"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {mediaError && (
          <div style={{ marginTop: 8, fontFamily: BODY, fontSize: '0.75rem', color: C.red }}>
            {mediaError}
          </div>
        )}
      </div>

      {/* Review tips */}
      <div>
        <span
          onClick={() => setShowTips(!showTips)}
          style={{
            fontFamily: BODY, fontSize: '0.78rem', color: C.gold,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          {showTips ? 'Hide tips' : 'Tips for a helpful review'}
        </span>
        {showTips && (
          <ul style={{
            margin: '8px 0 0', paddingLeft: 20,
            opacity: 1, transform: 'translateY(0)',
            transition: 'opacity 0.2s, transform 0.2s',
          }}>
            {tips.map((t, i) => (
              <li key={i} style={{ fontFamily: BODY, fontSize: '0.78rem', color: C.muted, lineHeight: 1.8 }}>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={mutation.isPending || uploadingMedia || isAnalyzingToxicity || isToxicDetected}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.gold, color: '#fff', fontFamily: BODY,
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            opacity: (mutation.isPending || uploadingMedia || isAnalyzingToxicity || isToxicDetected) ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {(mutation.isPending || uploadingMedia) && (
            <span style={{ display: 'inline-block', animation: 'reviewSpin 0.8s linear infinite', marginRight: 6 }}>&#9676;</span>
          )}
          {uploadingMedia ? 'Uploading Media...' : (isEdit ? 'Update Review' : 'Submit Review')}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              padding: '12px 28px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: 'transparent',
              color: C.muted, fontFamily: BODY, fontSize: '0.88rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {mutation.error && (
        <div style={{
          background: 'rgba(185,28,28,0.06)', borderLeft: `3px solid ${C.red}`,
          borderRadius: 6, padding: '10px 14px',
          fontFamily: BODY, fontSize: '0.82rem', color: C.red,
        }}>
          {mutation.error.message || 'Failed to submit review.'}
        </div>
      )}

      <style>{`
        @keyframes reviewSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes toxicitySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
};

export default ReviewForm;
