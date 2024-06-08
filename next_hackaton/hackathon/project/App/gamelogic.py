class GameState:
    def __init__(self):
        self.left_bank = {'wolf', 'sheep', 'cabbage'}
        self.right_bank = set()
        self.boat = 'left'
        self.history = []

    def move(self, item=None):
        if self.boat == 'left':
            if item:
                if item in self.left_bank:
                    self.left_bank.remove(item)
                    self.right_bank.add(item)
                else:
                    return False
            self.boat = 'right'
        else:
            if item:
                if item in self.right_bank:
                    self.right_bank.remove(item)
                    self.left_bank.add(item)
                else:
                    return False
            self.boat = 'left'
        
        self.history.append((self.left_bank.copy(), self.right_bank.copy(), self.boat))
        return True

    def is_valid_state(self):
        if 'sheep' in self.left_bank and 'wolf' in self.left_bank and 'cabbage' not in self.left_bank:
            return False
        if 'sheep' in self.right_bank and 'wolf' in self.right_bank and 'cabbage' not in self.right_bank:
            return False
        return True

    def is_game_won(self):
        return self.left_bank == set()