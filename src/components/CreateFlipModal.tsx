import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

const CreateFlipModal = () => {
  const { connected, connect } = useWallet();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (!connected) {
      connect();
      return;
    }
    if (!question.trim() || !deadline.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    // In production, this would call the smart contract
    toast.success('Flip created! (demo mode — no contract deployed yet)');
    setOpen(false);
    setQuestion('');
    setDeadline('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Flip
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create a New Flip</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              placeholder="Will BTC hit $200K by 2027?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Deadline (block height)</Label>
            <Input
              type="number"
              placeholder="190000"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {connected ? 'Create Flip' : 'Connect Wallet to Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlipModal;
